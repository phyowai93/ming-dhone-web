const http = require('http');
const { Telegraf, Markup } = require('telegraf');

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

// 👉 [အရေးကြီး] သင့်ရဲ့ Telegram Admin User ID ထည့်ရန် (ဥပမာ: '123456789')
// Admin ID သိရန် Telegram တွင် @userinfobot ထံ သွား၍ /start နှိပ်ပြီး ကိုယ့် ID ကို ယူပါ။
const ADMIN_CHAT_ID = '5889915101'; 

// User များ၏ ဝယ်ယူမည့်အခြေအနေ မှတ်သားရန်
const userStates = new Map();

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Chat box အောက်ခြေ မီနူး
const bottomMenu = Markup.keyboard([
  ['🏠 Main Menu', '📞 Contact Admin'],
  ['<<< နောက်သို့', '>>> ရှေ့သို့']
]).resize();

bot.start((ctx) => {
  ctx.reply(
    'မင်္ဂလာပါ! Ming Dhone 3D Model Marketplace မှ ကြိုဆိုပါတယ်။\nအောက်ပါ Menu ကို ရွေးချယ်ပါ -',
    bottomMenu
  );
});

bot.hears('🏠 Main Menu', async (ctx) => {
  ctx.reply(
    '💎 **Ming Dhone Paid Models**',
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

bot.hears('>>> ရှေ့သို့', async (ctx) => {
  ctx.reply('➡️ နောက်စာမျက်နှာသို့ မရှိသေးပါ။');
});

bot.hears('<<< နောက်သို့', async (ctx) => {
  ctx.reply('⬅️ ရှေ့စာမျက်နှာသို့ မရှိသေးပါ။');
});

// Model 1: ထီးလိုမင်းလို ဘုရား
bot.action('buy_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(ctx.from.id, 'buddha'); // မှတ်သားထားမည်
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './buddha1.jpg' }, caption: '🙏 ထီးလိုမင်းလို ဘုရား 3D Model (STL)\n\n💰 ဈေးနှုန်း: 15,000 KS' },
      { type: 'photo', media: { source: './buddha2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ဖြင့် ငွေလွှဲပြီး ငွေလွှဲပြေစာ (Screenshot) ပုံကို ဤဘော့ချတ်ထဲသို့ တိုက်ရိုက် ပို့ပေးပါရန်။',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_buddha')]])
    );
  } catch (error) {
    ctx.reply('🙏 ထီးလိုမင်းလို ဘုရား (15,000 KS)\nပုံများ တင်ရာတွင် အမှားရှိနေပါသည်။ KBZPay အချက်အလက် ကြည့်ရန် နှိပ်ပါ -',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_buddha')]]));
  }
});

// Model 2: Night Fury
bot.action('buy_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  userStates.set(ctx.from.id, 'nightfury'); // မှတ်သားထားမည်
  try {
    await ctx.replyWithMediaGroup([
      { type: 'photo', media: { source: './nightfury1.jpg' }, caption: '🐉 Night Fury 3D Model (STL)\n\n💰 ဈေးနှုန်း: 200 KS' },
      { type: 'photo', media: { source: './nightfury2.jpg' } }
    ]);
    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ဖြင့် ငွေလွှဲပြီး ငွေလွှဲပြေစာ (Screenshot) ပုံကို ဤဘော့ချတ်ထဲသို့ တိုက်ရိုက် ပို့ပေးပါရန်။',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_nightfury')]])
    );
  } catch (error) {
    ctx.reply('🐉 Night Fury (200 KS)\nပုံများ တင်ရာတွင် အမှားရှိနေပါသည်။ KBZPay အချက်အလက် ကြည့်ရန် နှိပ်ပါ -',
      Markup.inlineKeyboard([[Markup.button.callback('💳 KBZPay အချက်အလက် ကြည့်ရန်', 'pay_kpay_nightfury')]]));
  }
});

// KPay Details (Buddha)
bot.action('pay_kpay_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  const msg = '💳 **KBZPay Payment Details**\n\n📱 KPay Number: `09687880957`\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 15,000 KS\n\n📌 ငွေလွှဲပြီးပါက **စလစ်ပုံ (Screenshot)** ကို ဤချတ်ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg, parse_mode: 'Markdown' }); } 
  catch (e) { ctx.reply(msg, { parse_mode: 'Markdown' }); }
});

// KPay Details (Night Fury)
bot.action('pay_kpay_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  const msg = '💳 **KBZPay Payment Details**\n\n📱 KPay Number: `09687880957`\n👤 Name: Phyo Wai Kyaw\n💰 Amount: 200 KS\n\n📌 ငွေလွှဲပြီးပါက **စလစ်ပုံ (Screenshot)** ကို ဤချတ်ထဲသို့ တိုက်ရိုက် ပို့ပေးပါ။';
  try { await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, { caption: msg, parse_mode: 'Markdown' }); } 
  catch (e) { ctx.reply(msg, { parse_mode: 'Markdown' }); }
});

// Customer က ပုံ (Screenshot) ပို့လိုက်သည့်အခါ
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  const product = userStates.get(userId) || 'unknown_product';

  // Admin ထံသို့ စလစ်ပုံနှင့် အတည်ပြုရန် ခလုတ်များ ပို့ပေးမည်
  try {
    await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
      caption: `🔔 **ငွေလွှဲပြေစာအသစ် လက်ခံရရှိပါပြီ**\n\n` +
               `👤 ဝယ်ယူသူ: ${username} (ID: \`${userId}\`)\n` +
               `📦 ဝယ်ယူလိုသော Model: **${product}**\n\n` +
               `ငွေဝင်/မဝင် စစ်ဆေးပြီးပါက အောက်ပါခလုတ်ကို နှိပ်၍ ဖိုင်ပို့ပေးပါ။`,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`✅ ဖိုင်ပို့မည် (${product})`, `approve_${product}_${userId}`)]
      ])
    });

    await ctx.reply('✅ ငွေလွှဲပြေစာ (Screenshot) လက်ခံရရှိပါပြီ။ Admin မှ ငွေစာရင်းစစ်ဆေးပြီးပါက ဤဘော့မှတစ်ဆင့် STL ဖိုင်ကို အလိုအလျောက် ပို့ပေးပါမည်။ ခဏစောင့်ဆိုင်းပေးပါ။');
  } catch (err) {
    console.error('Admin ထံ ပုံပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    ctx.reply('⚠️ စလစ်ပုံ ပို့ရာတွင် အခက်အခဲရှိနေပါသည်။ Admin (@TharPhyo9) ထံ တိုက်ရိုက် ပို့ပေးပါ။');
  }
});

// Admin က "✅ ဖိုင်ပို့မည်" ခလုတ်ကို နှိပ်လိုက်သောအခါ
bot.action(/^approve_(.+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const product = ctx.match[1];
  const targetUserId = ctx.match[2];

  let fileName = '';
  let fileCaption = '';

  if (product === 'buddha') {
    fileName = './buddha.stl'; // Folder ထဲရှိ ဖိုင်အမှန်နာမည်
    fileCaption = '🙏 ကျေးဇူးတင် ပါတယ်။ ထီးလိုမင်းလို ဘုရား 3D Model (STL) ဖိုင်ကို ပို့ပေးလိုက်ပါပြီ။';
  } else if (product === 'nightfury') {
    fileName = './nightfury.stl'; // Folder ထဲရှိ ဖိုင်အမှန်နာမည်
    fileCaption = '🐉 ကျေးဇူးတင် ပါတယ်။ Night Fury 3D Model (STL) ဖိုင်ကို ပို့ပေးလိုက်ပါပြီ။';
  }

  try {
    // Customer ထံသို့ STL ဖိုင် ပို့ခြင်း
    await bot.telegram.sendDocument(targetUserId, { source: fileName }, { caption: fileCaption });
    await ctx.reply(`✅ Customer (ID: ${targetUserId}) ထံသို့ ${product} ဖိုင် ပို့ပြီးပါပြီ။`);
  } catch (err) {
    console.error('ဖိုင်ပို့ရာတွင် အမှားဖြစ်နေသည်:', err);
    await ctx.reply(`❌ ဖိုင်ပို့မရပါ။ Server ထဲတွင် "${fileName}" ဖိုင် ရှိမရှိ စစ်ဆေးပါ။`);
  }
});

bot.launch()
  .then(() => { console.log('Ming Dhone Bot စတင်အလုပ်လုပ်နေပါပြီ...'); })
  .catch((err) => { console.error('အမှားအယွင်းရှိနေပါသည်:', err); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
