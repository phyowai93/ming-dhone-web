const http = require('http');
const { Telegraf, Markup } = require('telegraf');

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

// 👉 Admin Telegram ID
const ADMIN_CHAT_ID = '5889915101'; 

const userStates = new Map();
const userWallets = new Map(); // Customer တစ်ဦးချင်းစီ၏ လက်ကျန်ငွေ သိမ်းဆည်းရန်

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

const bottomMenu = Markup.keyboard([
  ['🏠 Main Menu', '📞 Contact Admin'],
  ['💰 Wallet', '📥 ငွေဖြည့်ရန်']
]).resize();

bot.start((ctx) => {
  ctx.reply('မင်္ဂလာပါ! Ming Dhone 3D Model Marketplace မှ ကြိုဆိုပါတယ်။\nအောက်ပါ Menu ကို ရွေးချယ်ပါ -', bottomMenu);
});

bot.hears('🏠 Main Menu', async (ctx) => {
  ctx.reply(
    '💎Premium Models💎',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
        [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')]
      ])
    }
  );
});

bot.hears('📞 Contact Admin', async (ctx) => {
  ctx.reply('📞 အသေးစိတ် မေးမြန်းလိုပါက Admin (@TharPhyo9) ထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။');
});

bot.hears('💰 Wallet', async (ctx) => {
  const userId = Number(ctx.from.id); // Number သို့ ပြောင်းလဲခြင်း
  const balance = userWallets.get(userId) || 0;
  ctx.reply(
    '💰 **သင့်ရဲ့ ပိုက်ဆံအိတ် (Wallet)**\n\n' +
    '👤 အသုံးပြုသူ: ' + ctx.from.first_name + '\n' +
    '💳 လက်ကျန်ငွေ: `' + balance.toLocaleString() + ' KS`\n\n' +
    '📌 ငွေဖြည့်သွင်းလိုပါက အောက်ပါ **"📥 ငွေဖြည့်ရန်"** ခလုတ်ကို နှိပ်ပါ။',
    { parse_mode: 'Markdown' }
  );
});

bot.hears('📥 ငွေဖြည့်ရန်', async (ctx) => {
  userStates.set(Number(ctx.from.id), 'topup');
  const topUpMsg = '💳 **KBZPay ဖြင့် ငွေဖြည့်သွင်းရန်**\n\n' +
                   '📱 KPay Number: `09687880957`\n' +
                   '👤 Name: Phyo Wai Kyaw\n\n' +
                   '📌 **ငွေဖြည့်နည်းလမ်း:**\n' +
                   '၁။ အထက်ပါ KPay အကောင့်သို့ လိုအပ်သော ငွေပမာဏ လွှဲပေးပါ။\n' +
                   '၂။ ငွေလွှဲပြီးပါက **Transaction Slip (စလစ်ပုံ)** ကို ဤ bot chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။ Admin မှ စစ်ဆေးပြီး Wallet ထဲသို့ ငွေထည့်သွင်းပေးပါမည်။';

  try {
    await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: topUpMsg, parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply(topUpMsg + '\n\n(⚠️ QR Code ပုံ ရှာမတွေ့ပါ)', { parse_mode: 'Markdown' });
  }
});

bot.action('buy_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(Number(ctx.from.id), 'buddha');
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './buddha1.jpg' }, caption: '🙏 ထီးလိုမင်းလို ဘုရား 3D Model (STL)\n\n💰 ဈေးနှုန်း: 15,000 KS' },
      { type: 'photo', media: { source: './buddha2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ဖြင့် ငွေလွှဲပြီး ငွေလွှဲပြေစာ (Screenshot) ပုံကို ဤ bot chatထဲသို့ တိုက်ရိုက် ပို့ပေးပါရန်။',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_buddha')]])
    );
  } catch (error) {
    ctx.reply('🙏 ထီးလိုမင်းလို ဘုရား (15,000 KS)\nKBZPay အချက်အလက် ကြည့်ရန် နှိပ်ပါ -',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_buddha')]]));
  }
});

bot.action('buy_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(Number(ctx.from.id), 'nightfury');
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './nightfury1.jpg' }, caption: '🐉 Night Fury 3D Model (STL)\n\n💰 ဈေးနှုန်း: 200 KS' },
      { type: 'photo', media: { source: './nightfury2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ဖြင့် ငွေလွှဲပြီး ငွေလွှဲပြေစာ (Screenshot) ပုံကို ဤ bot chatထဲသို့ တိုက်ရိုက် ပို့ပေးပါရန်။',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_nightfury')]])
    );
  } catch (error) {
    ctx.reply('🐉 Night Fury (200 KS)\nKBZPay အချက်အလက် ကြည့်ရန် နှိပ်ပါ -',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_nightfury')]]));
  }
});

bot.action('pay_kpay_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  const msg = '💳 **KBZPay Payment Details**\n\n📱 KPay Number: `09687880957`\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 15,000 KS\n\n📌 ငွေလွှဲပြီးပါက **စလစ်ပုံ (Screenshot)** ကို ဤ chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg, parse_mode: 'Markdown' }); } 
  catch (e) { ctx.reply(msg, { parse_mode: 'Markdown' }); }
});

bot.action('pay_kpay_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  const msg = '💳 **KBZPay Payment Details**\n\n📱 KPay Number: `09687880957`\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 200 KS\n\n📌 ငွေလွှဲပြီးပါက **စလစ်ပုံ (Screenshot)** ကို ဤ chat ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg, parse_mode: 'Markdown' }); } 
  catch (e) { ctx.reply(msg, { parse_mode: 'Markdown' }); }
});

bot.on('photo', async (ctx) => {
  const userId = Number(ctx.from.id);
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  const state = userStates.get(userId) || 'buddha';

  try {
    if (state === 'topup') {
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
        caption: `🔔 **ငွေဖြည့်သွင်းရန် စလစ်အသစ်**\n\n` +
                 `👤 ဝယ်ယူသူ: ${username} (ID: \`${userId}\`)\n\n` +
                 `ငွေလွှဲငွေပမာဏ စစ်ဆေးပြီး အောက်ပါခလုတ်များမှ သင့်တော်သည့် ငွေပမာဏကို ရွေးချယ်ပေးပါ -`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(`+200 KS`, `topup_200_${userId}`),
            Markup.button.callback(`+1,000 KS`, `topup_1000_${userId}`),
            Markup.button.callback(`+5,000 KS`, `topup_5000_${userId}`)
          ],
          [
            Markup.button.callback(`+15,000 KS`, `topup_15000_${userId}`),
            Markup.button.callback(`+20,000 KS`, `topup_20000_${userId}`)
          ]
        ])
      });

      await ctx.reply('✅ ငွေဖြည့်ပြေစာ (Screenshot) လက်ခံရရှိပါပြီ။ Admin မှ ငွေစာရင်းစစ်ဆေးပြီးပါက သင့် Wallet ထဲသို့ ငွေဖြည့်သွင်းပေးပါမည်။');
    } else {
      const product = state;
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
        caption: `🔔 **ငွေလွှဲပြေစာအသစ် (Model ဝယ်ယူမှု)**\n\n` +
                 `👤 ဝယ်ယူသူ: ${username} (ID: \`${userId}\`)\n` +
                 `📦 ဝယ်ယူလိုသော Model: **${product}**\n\n` +
                 `ငွေဝင်/မဝင် စစ်ဆေးပြီးပါက အောက်ပါခလုတ်ကို နှိပ်၍ Link ပို့ပေးပါ။`,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`✅ Download Link ပို့မည်`, `approve_${product}_${userId}`)]
        ])
      });

      await ctx.reply('✅ ငွေလွှဲပြေစာ (Screenshot) လက်ခံရရှိပါပြီ။ Admin မှ ငွေစာရင်းစစ်ဆေးပြီးပါက ဤဘော့မှတစ်ဆင့် Download Link ကို ပို့ပေးပါမည်။');
    }
  } catch (err) {
    console.error('Admin ထံ ပုံပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    ctx.reply('⚠️ စလစ်ပုံ ပို့ရာတွင် အခက်အခဲရှိနေပါသည်။ Admin (@TharPhyo9) ထံ တိုက်ရိုက် ပို့ပေးပါ။');
  }
});

bot.action(/^topup_(\d+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const amount = parseInt(ctx.match[1]);
  const targetUserId = Number(ctx.match[2]); // Number သို့ ပြောင်းလဲခြင်း

  const currentBalance = userWallets.get(targetUserId) || 0;
  const newBalance = currentBalance + amount;
  userWallets.set(targetUserId, newBalance);

  try {
    await bot.telegram.sendMessage(
      targetUserId,
      `🎉 **ငွေဖြည့်သွင်းမှု အောင်မြင်ပါသည်။**\n\n` +
      `💰 ဖြည့်သွင်းငွေ: \`${amount.toLocaleString()} KS\`\n` +
      `💳 လက်ကျန်ငွေအသစ်: \`${newBalance.toLocaleString()} KS\``,
      { parse_mode: 'Markdown' }
    );

    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ၏ Wallet ထဲသို့ ${amount.toLocaleString()} KS ထည့်သွင်းပြီးပါပြီ။ (လက်ကျန်ငွေ: ${newBalance.toLocaleString()} KS)`);
  } catch (err) {
    console.error('Customer ထံ Message ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ Customer ထံ အကြောင်းကြားစာ ပို့မရပါ။`);
  }
});

bot.action(/^approve_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const product = ctx.match[1];
  const targetUserId = Number(ctx.match[2]);

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
