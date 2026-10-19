const http = require('http');
const { Telegraf, Markup } = require('telegraf');

// ၁။ Render ပိတ်မသွားစေရန် HTTP Server ဖွင့်ခြင်း
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Ming Dhone Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

// ၂။ Render Environment Variable မှ Token ကို ယူခြင်း
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is missing in Render Environment Variables!");
}
const bot = new Telegraf(token);

// Error Handler
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Menus & Keyboards
const bottomMenu = Markup.keyboard([
  ['🛒 Main Menu', '📞 Contact Admin'],
  ['<<< နောက်သို့', '>>> ရှေ့သို့']
]).resize();

const productsMenu = Markup.inlineKeyboard([
  [Markup.button.callback('ထီးလိုမင်းလို ဘုရား (15,000 KS)', 'prod_buddha')],
  [Markup.button.callback('Night Fury (200 KS)', 'prod_nightfury')]
]);

// Handlers
bot.start((ctx) => {
  ctx.reply(
    'မင်္ဂလာပါ! Ming Dhone 3D Model Marketplace မှ ကြိုဆိုပါတယ်။\n\nအောက်ပါ မီနူးမှတစ်ဆင့် လိုအပ်သည်များကို ရွေးချယ်နိုင်ပါသည်။',
    bottomMenu
  );
});

bot.hears('🛒 Main Menu', (ctx) => {
  ctx.reply('ဝယ်ယူနိုင်သော 3D Model များ -', productsMenu);
});

bot.hears('📞 Contact Admin', (ctx) => {
  ctx.reply('အသေးစိတ်မေးမြန်းရန်နှင့် ငွေလွှဲပြေစာပေးပို့ရန် Admin ကို တိုက်ရိုက်ဆက်သွယ်ပါ - @TharPhyo9');
});

bot.hears('<<< နောက်သို့', (ctx) => {
  ctx.reply('ပင်မစာမျက်နှာသို့ ပြန်ရောက်ပါပြီ။', bottomMenu);
});

bot.hears('>>> ရှေ့သို့', (ctx) => {
  ctx.reply('ဝယ်ယူနိုင်သော 3D Model အမျိုးအစားများ -', productsMenu);
});

bot.action('prod_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithPhoto({ source: './buddha1.jpg' });
    await ctx.replyWithPhoto({ source: './buddha2.jpg' }, {
      caption: '<b>ထီးလိုမင်းလို ဘုရား 3D Model</b>\n\nဈေးနှုန်း - 15,000 KS\n\nဝယ်ယူရန် KPay QR ဖြင့် ငွေလွှဲပြီး ပြေစာအား Admin ထံ ပေးပို့ပေးပါ။',
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💳 KPay QR ကြည့်ရန်', 'show_kpay')]
      ])
    });
  } catch (err) {
    ctx.reply('ထီးလိုမင်းလို ဘုရား - 15,000 KS\n\n(ပုံဖိုင်များ တင်ရန် ကျန်ရှိနေပါသည်)');
  }
});

bot.action('prod_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithPhoto({ source: './nightfury1.jpg' });
    await ctx.replyWithPhoto({ source: './nightfury2.jpg' }, {
      caption: '<b>Night Fury 3D Model</b>\n\nဈေးနှုန်း - 200 KS\n\nဝယ်ယူရန် KPay QR ဖြင့် ငွေလွှဲပြီး ပြေစာအား Admin ထံ ပေးပို့ပေးပါ။',
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💳 KPay QR ကြည့်ရန်', 'show_kpay')]
      ])
    });
  } catch (err) {
    ctx.reply('Night Fury - 200 KS\n\n(ပုံဖိုင်များ တင်ရန် ကျန်ရှိနေပါသည်)');
  }
});

bot.action('show_kpay', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithPhoto({ source: './kpay_qr.jpg' }, {
      caption: 'ငွေလွှဲပြီးပါက ပြေစာအား Admin (@TharPhyo9) ထံ ပေးပို့၍ STL File ရယူနိုင်ပါသည်။'
    });
  } catch (err) {
    ctx.reply('KPay QR Code ဖိုင်ကို မတွေ့ရှိပါ။');
  }
});

// Launch Bot
bot.launch();
console.log('Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
