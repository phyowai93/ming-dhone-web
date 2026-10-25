const http = require('http');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');

// 👉 မည်သည့်အမှားကြောင့်မှ ဆာဗာ လုံးဝ ပိတ်မသွားစေရန် ကာကွယ်ခြင်း (Crash Protection)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Render ဘက်မှ 24/7 Online ဖြစ်နေစေရန် HTTP Server ဖွင့်ခြင်း
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ming Dhone Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is missing in Render Environment Variables!");
}
const bot = new Telegraf(token);

// 👉 Memory Backup Wallet
const memoryWallets = new Map();
let dbLastError = 'ချိတ်ဆက်နေဆဲ...';

// 👉 MongoDB သို့ ချိတ်ဆက်ခြင်း
let rawMongoUri = (process.env.MONGO_URI || '').trim();
rawMongoUri = rawMongoUri.replace(/^["']|["']$/g, '').replace(/<([^>]+)>/g, '$1');

if (rawMongoUri) {
  mongoose.connect(rawMongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('MongoDB သို့ အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ');
      dbLastError = null;
    })
    .catch(err => {
      console.error('MongoDB ချိတ်ဆက်မှု အမှား:', err.message);
      dbLastError = err.message;
    });
} else {
  dbLastError = 'Render Environment တွင် MONGO_URI မရှိသေးပါ';
  console.error(dbLastError);
}

// 🗄️ Wallet Database Schema ဖန်တီးခြင်း
const walletSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  balance: { type: Number, default: 0 }
});
const Wallet = mongoose.model('Wallet', walletSchema);

// 👉 ငွေလက်ကျန် စစ်ဆေးသည့် Function
const getBalance = async (userId) => {
  const numericUserId = Number(userId);
  const memBalance = memoryWallets.get(numericUserId) || 0;

  if (mongoose.connection.readyState === 1) {
    try {
      const wallet = await Wallet.findOne({ userId: numericUserId });
      if (wallet && typeof wallet.balance === 'number') {
        const finalBal = Math.max(wallet.balance, memBalance);
        memoryWallets.set(numericUserId, finalBal);
        return finalBal;
      }
    } catch (err) {
      dbLastError = err.message;
    }
  }
  return memBalance;
};

// 👉 ငွေပမာဏ ပေါင်းထည့်/ဖြတ်တောက်သည့် Function
const updateBalance = async (userId, amount) => {
  const numericUserId = Number(userId);
  const numAmount = Number(amount) || 0;

  if (mongoose.connection.readyState === 1) {
    try {
      let wallet = await Wallet.findOneAndUpdate(
        { userId: numericUserId },
        { $inc: { balance: numAmount } },
        { upsert: true, new: true }
      );
      if (wallet && wallet.balance < 0) {
        wallet.balance = 0;
        await wallet.save();
      }
      const finalBal = wallet ? wallet.balance : 0;
      memoryWallets.set(numericUserId, finalBal);
      dbLastError = null;
      return finalBal;
    } catch (err) {
      console.error('Balance Update DB Error:', err.message);
      dbLastError = err.message;
    }
  }

  let currentBalance = memoryWallets.get(numericUserId) || 0;
  let newBalance = currentBalance + numAmount;
  if (newBalance < 0) newBalance = 0;
  memoryWallets.set(numericUserId, newBalance);
  return newBalance;
};

// 👉 Admin Telegram ID
const ADMIN_CHAT_ID = '5889915101'; 

const userStates = new Map();
const userTopupAmounts = new Map(); 

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

const bottomMenu = Markup.keyboard([
  ['🏠 Main Menu', '📞 Contact Admin'],
  ['💰 Wallet', '📥 ငွေဖြည့်ရန်']
]).resize();

bot.start(async (ctx) => {
  await ctx.reply('မင်္ဂလာပါ! Ming Dhone 3D Model Marketplace မှ ကြိုဆိုပါတယ်။\nအောက်ပါ Menu ကို ရွေးချယ်ပါ -', bottomMenu);
});

// 👉 Database အခြေအနေကို စစ်ဆေးရန် Command (Markdown Error မတက်စေရန် ရိုးရိုးစာသားဖြင့် ပို့ပေးသည်)
bot.command('db', async (ctx) => {
  const isConnected = mongoose.connection.readyState === 1;
  await ctx.reply(
    `🗄️ Database စစ်ဆေးချက်\n\n` +
    `• အခြေအနေ: ${isConnected ? '🟢 ချိတ်ဆက်ထားသည် (Connected)' : '🔴 မချိတ်မိသေးပါ (Disconnected)'}\n` +
    `• MONGO_URI ထည့်ထားမှု: ${rawMongoUri ? '✅ ရှိသည်' : '❌ မရှိပါ'}\n` +
    `• မှတ်ချက်: ${dbLastError || 'အမှားမရှိပါ'}`
  );
});

bot.hears('🏠 Main Menu', async (ctx) => {
  await ctx.reply(
    '💎 Premium Models 💎',
    Markup.inlineKeyboard([
      [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
      [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')]
    ])
  );
});

bot.hears('📞 Contact Admin', async (ctx) => {
  await ctx.reply('📞 အသေးစိတ် မေးမြန်းလိုပါက Admin (@TharPhyo9) ထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။');
});

bot.hears('💰 Wallet', async (ctx) => {
  const userId = Number(ctx.from.id);
  const balance = await getBalance(userId);
  await ctx.reply(
    '💰 သင့်ရဲ့ ပိုက်ဆံအိတ် (Wallet)\n\n' +
    '👤 အသုံးပြုသူ: ' + ctx.from.first_name + '\n' +
    '💳 လက်ကျန်ငွေ: ' + balance.toLocaleString() + ' KS\n\n' +
    '📌 ငွေဖြည့်သွင်းလိုပါက အောက်ပါ "📥 ငွေဖြည့်ရန်" ခလုတ်ကို နှိပ်ပါ။'
  );
});

bot.hears('📥 ငွေဖြည့်ရန်', async (ctx) => {
  await ctx.reply(
    '📥 ငွေဖြည့်သွင်းမည့် ပမာဏကို ရွေးချယ်ပါ -',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('500 KS', 'select_topup_500'),
        Markup.button.callback('5,000 KS', 'select_topup_5000')
      ],
      [
        Markup.button.callback('10,000 KS', 'select_topup_10000')
      ]
    ])
  );
});

bot.action(/^select_topup_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1]);
  const userId = Number(ctx.from.id);

  userStates.set(userId, 'topup');
  userTopupAmounts.set(userId, amount);

  const topUpMsg = '💳 KBZPay ဖြင့် ငွေဖြည့်သွင်းရန်\n\n' +
                   '💰 ရွေးချယ်ထားသော ပမာဏ: ' + amount.toLocaleString() + ' KS\n\n' +
                   '📱 KPay Number: 09687880957\n' +
                   '👤 Name: Phyo Wai Kyaw\n\n' +
                   '📌 ငွေဖြည့်နည်းလမ်း:\n' +
                   '၁။ အထက်ပါ KPay အကောင့်သို့ ' + amount.toLocaleString() + ' KS လွှဲပေးပါ။\n' +
                   '၂။ ငွေလွှဲပြီးပါက Transaction Slip (စလစ်ပုံ) ကို ဤ bot chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';

  try {
    await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: topUpMsg });
  } catch (error) {
    await ctx.reply(topUpMsg + '\n\n(⚠️ QR Code ပုံ ရှာမတွေ့ပါ)');
  }
});

bot.action('buy_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './buddha1.jpg' }, caption: '🙏 ထီးလိုမင်းလို ဘုရား 3D Model (STL)\n\n💰 ဈေးနှုန်း: 15,000 KS' },
      { type: 'photo', media: { source: './buddha2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူမည့် နည်းလမ်းကို ရွေးချယ်ပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💰 Wallet ဖြင့် ဝယ်မည် (15,000 KS)', 'pay_wallet_buddha')],
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေလွှဲဝယ်မည်', 'pay_kpay_buddha')]
      ])
    );
  } catch (error) {
    await ctx.reply('🙏 ထီးလိုမင်းလို ဘုရား (15,000 KS)\nဝယ်ယူမည့် နည်းလမ်းကို ရွေးချယ်ပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💰 Wallet ဖြင့် ဝယ်မည် (15,000 KS)', 'pay_wallet_buddha')],
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေလွှဲဝယ်မည်', 'pay_kpay_buddha')]
      ]));
  }
});

bot.action('buy_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './nightfury1.jpg' }, caption: '🐉 Night Fury 3D Model (STL)\n\n💰 ဈေးနှုန်း: 200 KS' },
      { type: 'photo', media: { source: './nightfury2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူမည့် နည်းလမ်းကို ရွေးချယ်ပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💰 Wallet ဖြင့် ဝယ်မည် (200 KS)', 'pay_wallet_nightfury')],
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေလွှဲဝယ်မည်', 'pay_kpay_nightfury')]
      ])
    );
  } catch (error) {
    await ctx.reply('🐉 Night Fury (200 KS)\nဝယ်ယူမည့် နည်းလမ်းကို ရွေးချယ်ပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💰 Wallet ဖြင့် ဝယ်မည် (200 KS)', 'pay_wallet_nightfury')],
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေလွှဲဝယ်မည်', 'pay_kpay_nightfury')]
      ]));
  }
});

bot.action('pay_wallet_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = Number(ctx.from.id);
  const balance = await getBalance(userId);
  const price = 15000;

  if (balance < price) {
    return ctx.reply(`❌ သင့် Wallet ထဲတွင် ငွေလုံလောက်မှု မရှိပါ။\n\n💳 လက်ကျန်ငွေ: ${balance.toLocaleString()} KS\n💰 လိုအပ်သောငွေ: ${price.toLocaleString()} KS\n\nကျေးဇူးပြု၍ အောက်ခြေမီနူးမှ "📥 ငွေဖြည့်ရန်" ကို နှိပ်၍ ငွေဖြည့်ပါ။`);
  }

  const newBalance = await updateBalance(userId, -price);

  const linkMsg = '🙏 ကျေးဇူးတင်ပါတယ်။ ထီးလိုမင်းလို ဘုရား 3D Model (STL) ဖိုင်ကို အောက်ပါ Link မှ Download ရယူနိုင်ပါပြီ -\n\n🔗 https://drive.google.com/file/d/12NFsX8QQtQqC1EnaF9f4TOef8YenyWX0/view?usp=drive_link';
  await ctx.reply(`✅ Wallet ထဲမှ ${price.toLocaleString()} KS ဖြတ်တောက်ပြီး ဝယ်ယူမှု အောင်မြင်ပါသည်။\n💳 လက်ကျန်ငွေအသစ်: ${newBalance.toLocaleString()} KS`);
  await ctx.reply(linkMsg);
});

bot.action('pay_wallet_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = Number(ctx.from.id);
  const balance = await getBalance(userId);
  const price = 200;

  if (balance < price) {
    return ctx.reply(`❌ သင့် Wallet ထဲတွင် ငွေလုံလောက်မှု မရှိပါ။\n\n💳 လက်ကျန်ငွေ: ${balance.toLocaleString()} KS\n💰 လိုအပ်သောငွေ: ${price.toLocaleString()} KS\n\nကျေးဇူးပြု၍ အောက်ခြေမီနူးမှ "📥 ငွေဖြည့်ရန်" ကို နှိပ်၍ ငွေဖြည့်ပါ။`);
  }

  const newBalance = await updateBalance(userId, -price);

  const linkMsg = '🐉 ကျေးဇူးတင်ပါတယ်။ Night Fury 3D Model (STL) ဖိုင်ကို အောက်ပါ Link မှ Download ရယူနိုင်ပါပြီ -\n\n🔗 https://drive.google.com/file/d/1fbf3FDxSut79SUK6X-JvmqM4smyusWbQ/view?usp=drive_link';
  await ctx.reply(`✅ Wallet ထဲမှ ${price.toLocaleString()} KS ဖြတ်တောက်ပြီး ဝယ်ယူမှု အောင်မြင်ပါသည်။\n💳 လက်ကျန်ငွေအသစ်: ${newBalance.toLocaleString()} KS`);
  await ctx.reply(linkMsg);
});

bot.action('pay_kpay_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(Number(ctx.from.id), 'buddha');
  const msg = '💳 KBZPay Payment Details (ထီးလိုမင်းလို ဘုရား - 15,000 KS)\n\n📱 KPay Number: 09687880957\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 15,000 KS\n\n📌 ငွေလွှဲပြီးပါက စလစ်ပုံ (Screenshot) ကို ဤ chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg }); } 
  catch (e) { await ctx.reply(msg); }
});

bot.action('pay_kpay_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(Number(ctx.from.id), 'nightfury');
  const msg = '💳 KBZPay Payment Details (Night Fury - 200 KS)\n\n📱 KPay Number: 09687880957\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 200 KS\n\n📌 ငွေလွှဲပြီးပါက စလစ်ပုံ (Screenshot) ကို ဤ chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg }); } 
  catch (e) { await ctx.reply(msg); }
});

const validTexts = ['🏠 Main Menu', '📞 Contact Admin', '💰 Wallet', '📥 ငွေဖြည့်ရန်'];

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith('/') || validTexts.includes(text)) {
    return; 
  }

  try {
    await ctx.deleteMessage(); 
    const warning = await ctx.reply('⚠️ ကျေးဇူးပြု၍ မီနူးခလုတ်များကိုသာ အသုံးပြုပါ (သို့မဟုတ်) ငွေလွှဲစလစ်ပုံ (Screenshot) ကို ပို့ပေးပါ။');
    setTimeout(async () => {
      try { await ctx.telegram.deleteMessage(ctx.chat.id, warning.message_id); } catch(e) {}
    }, 5000); 
  } catch (err) {
    console.error('စာဖျက်ရာတွင် အမှားဖြစ်နေသည်:', err);
  }
});

// 👉 ငွေလွှဲစလစ်ပုံ ပို့လိုက်သည့်အခါ Loading (typing...) ပြသပြီး "စစ်ဆေးနေပါပြီ" ဟု ပြခြင်း
bot.on('photo', async (ctx) => {
  await ctx.sendChatAction('typing');

  const userId = Number(ctx.from.id);
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  const state = userStates.get(userId) || 'topup';

  await ctx.reply('⏳ စစ်ဆေးနေပါပြီ။ ခေတ္တစောင့်ပါ...');

  try {
    if (state === 'topup') {
      const topupAmount = userTopupAmounts.get(userId) || 500;
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
        caption: `🔔 ငွေဖြည့်သွင်းရန် စလစ်အသစ်\n\n` +
                 `👤 ဝယ်ယူသူ: ${username} (ID: ${userId})\n` +
                 `💰 ရွေးချယ်ထားသော ပမာဏ: ${topupAmount.toLocaleString()} KS\n\n` +
                 `အောက်ပါ ခလုတ်များကို ရွေးချယ်ပါ -`,
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`👀 Admin ထံ ပို့ပြီးကြောင်းပြမည်`, `ack_topup_${userId}_${topupAmount}`)],
          [Markup.button.callback(`✅ ငွေဖြည့်အတည်ပြုမည် (${topupAmount.toLocaleString()} KS)`, `approve_topup_${userId}_${topupAmount}`)]
        ])
      });
    } else {
      const product = state;
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
        caption: `🔔 ငွေလွှဲပြေစာအသစ် (Model ဝယ်ယူမှု)\n\n` +
                 `👤 ဝယ်ယူသူ: ${username} (ID: ${userId})\n` +
                 `📦 ဝယ်ယူလိုသော Model: ${product}\n\n` +
                 `အောက်ပါ ခလုတ်များကို ရွေးချယ်ပါ -`,
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`👀 Admin ထံ ပို့ပြီးကြောင်းပြမည်`, `ack_model_${userId}_${product}`)],
          [Markup.button.callback(`✅ Download Link ပို့မည်`, `approve_model_${userId}_${product}`)]
        ])
      });
    }
  } catch (err) {
    console.error('Admin ထံ ပုံပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply('⚠️ စလစ်ပုံ ပို့ရာတွင် အခက်အခဲရှိနေပါသည်။');
  }
});

// 👉 Admin က ပထမခလုတ်ကို နှိပ်သောအခါ
bot.action(/^ack_topup_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const targetUserId = Number(ctx.match[1]);
  const amount = parseInt(ctx.match[2]);

  try {
    await bot.telegram.sendMessage(
      targetUserId,
      `✅ စစ်ဆေးမှုအောင်မြင်ပါသည် (${amount.toLocaleString()} KS)။ ဆက်လက် လုပ်ဆောင်နေပါသည်။`
    );
    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ထံသို့ အကြောင်းကြားပြီးပါပြီ။`);
  } catch (err) {
    console.error('Customer ထံ Message ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ Customer ထံ အကြောင်းကြားစာ ပို့မရပါ။`);
  }
});

bot.action(/^ack_model_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const targetUserId = Number(ctx.match[1]);
  const product = ctx.match[2];

  try {
    await bot.telegram.sendMessage(
      targetUserId,
      `✅ စစ်ဆေးမှုအောင်မြင်ပါသည် (${product})။ ဆက်လက် လုပ်ဆောင်နေပါသည်။`
    );
    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ထံသို့ အကြောင်းကြားပြီးပါပြီ။`);
  } catch (err) {
    console.error('Customer ထံ Message ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ Customer ထံ အကြောင်းကြားစာ ပို့မရပါ။`);
  }
});

// 👉 Admin က ဒုတိယခလုတ် (ငွေဖြည့်အတည်ပြုမည်) ကို နှိပ်သောအခါ
bot.action(/^approve_topup_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const targetUserId = Number(ctx.match[1]);
  const amount = parseInt(ctx.match[2]);

  const newBalance = await updateBalance(targetUserId, amount);

  try {
    await bot.telegram.sendMessage(
      targetUserId,
      `🎉 ငွေဖြည့်သွင်းမှု အောင်မြင်ပါသည်။\n\n` +
      `💰 ဖြည့်သွင်းငွေ: ${amount.toLocaleString()} KS\n` +
      `💳 လက်ကျန်ငွေအသစ်: ${newBalance.toLocaleString()} KS`
    );

    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ၏ Wallet ထဲတွင် ငွေဖြည့်သွင်းပြီးပါပြီ။ (လက်ကျန်ငွေအသစ်: ${newBalance.toLocaleString()} KS)`);
  } catch (err) {
    console.error('Customer ထံ Message ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ Customer ထံ အကြောင်းကြားစာ ပို့မရပါ။`);
  }
});

// 👉 Admin က ဒုတိယခလုတ် (Download Link ပို့မည်) ကို နှိပ်သောအခါ
bot.action(/^approve_model_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const targetUserId = Number(ctx.match[1]);
  const product = ctx.match[2];

  let downloadLinkMessage = '';

  if (product === 'buddha') {
    downloadLinkMessage = '🙏 ကျေးဇူးတင်ပါတယ်။ ထီးလိုမင်းလို ဘုရား 3D Model (STL) ဖိုင်ကို အောက်ပါ Link မှ Download ရယူနိုင်ပါပြီ -\n\n🔗 https://drive.google.com/file/d/12NFsX8QQtQqC1EnaF9f4TOef8YenyWX0/view?usp=drive_link';
  } else if (product === 'nightfury') {
    downloadLinkMessage = '🐉 ကျေးဇူးတင်ပါတယ်။ Night Fury 3D Model (STL) ဖိုင်ကို အောက်ပါ Link မှ Download ရယူနိုင်ပါပြီ -\n\n🔗 https://drive.google.com/file/d/1fbf3FDxSut79SUK6X-JvmqM4smyusWbQ/view?usp=drive_link';
  }

  try {
    await bot.telegram.sendMessage(targetUserId, downloadLinkMessage);
    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ထံသို့ Download Link ပို့ပြီးပါပြီ။`);
  } catch (err) {
    console.error('Link ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ Link ပို့မရပါ။`);
  }
});

bot.launch()
  .then(() => { console.log('Ming Dhone Bot စတင်အလုပ်လုပ်နေပါပြီ...'); })
  .catch((err) => { console.error('အမှားအယွင်းရှိနေပါသည်:', err); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
