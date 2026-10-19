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

// Render Environment Variable မှ Token ကို ခေါ်ယူခြင်း
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("ERROR: BOT_TOKEN is missing in Render Environment Variables!");
}
const bot = new Telegraf(token);

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Chat box အောက်ခြေတွင် ပြသပေးမည့် Reply Keyboard မီနူး
const bottomMenu = Markup.keyboard([
  ['🏠 Main Menu', '📞 Contact Admin'],
  ['<<< နောက်သို့', '>>> ရှေ့သို့']
]).resize();

// /start လုပ်သည့်အခါ မီနူးပြသမည်
bot.start((ctx) => {
  ctx.reply(
    'မင်္ဂလာပါ! Ming Dhone 3D Model Marketplace မှ ကြိုဆိုပါတယ်။\nအောက်ပါ Menu ကို ရွေးချယ်ပါ -',
    bottomMenu
  );
});

// ၁။ Main Menu ခလုတ် (ထီးလိုမင်းလို ဘုရား နှင့် Night Fury နှစ်ခုလုံး ပါဝင်သည်)
bot.hears('🏠 Main Menu', async (ctx) => {
  ctx.reply(
    '💎PREMIUM MODELS💎',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
        [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')]
      ])
    }
  );
});

// ၂။ Contact Admin ခလုတ်
bot.hears('📞 Contact Admin', async (ctx) => {
  ctx.reply('📞 အသေးစိတ် မေးမြန်းလိုပါက Admin (@TharPhyo9) ထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။');
});

// ၃။ ရှေ့သို့ ခလုတ်
bot.hears('>>> ရှေ့သို့', async (ctx) => {
  ctx.reply('➡️ နောက်စာမျက်နှာသို့ မရှိသေးပါ။');
});

// ၄။ နောက်သို့ ခလုတ်
bot.hears('<<< နောက်သို့', async (ctx) => {
  ctx.reply('⬅️ ရှေ့စာမျက်နှာသို့ မရှိသေးပါ။');
});

// Inline Callback Handlers - ထီးလိုမင်းလို ဘုရား
bot.action('buy_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithMediaGroup([
      {
        type: 'photo',
        media: { source: './buddha1.jpg' },
        caption: '🙏 ထီးလိုမင်းလို ဘုရား 3D Model (STL)\n\n💰 ဈေးနှုန်း: 15,000 KS'
      },
      {
        type: 'photo',
        media: { source: './buddha2.jpg' }
      }
    ]);

    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ခလုတ်ကို နှိပ်၍ ငွေချေမှု အချက်အလက်များ ရယူပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေချေမည်', 'pay_kpay_buddha')]
      ])
    );
  } catch (error) {
    await ctx.reply(
      '🙏 ထီးလိုမင်းလို ဘုရား 3D Model (STL)\n💰 ဈေးနှုန်း: 15,000 KS\n\n(⚠️ ပုံဖိုင်များ ရှာမတွေ့ပါ၊ Folder ထဲတွင် "buddha1.jpg" နှင့် "buddha2.jpg" ရှိမရှိ စစ်ဆေးပါ)',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေချေမည်', 'pay_kpay_buddha')]
      ])
    );
  }
});

// Inline Callback Handlers - Night Fury
bot.action('buy_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.replyWithMediaGroup([
      {
        type: 'photo',
        media: { source: './nightfury1.jpg' },
        caption: '🐉 Night Fury 3D Model (STL)\n\n💰 ဈေးနှုန်း: 200 KS'
      },
      {
        type: 'photo',
        media: { source: './nightfury2.jpg' }
      }
    ]);

    await ctx.reply(
      '💳 ဝယ်ယူရန်အတွက် အောက်ပါ KPay ခလုတ်ကို နှိပ်၍ ငွေချေမှု အချက်အလက်များ ရယူပါ -',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေချေမည်', 'pay_kpay_nightfury')]
      ])
    );
  } catch (error) {
    await ctx.reply(
      '🐉 Night Fury 3D Model (STL)\n💰 ဈေးနှုန်း: 200 KS\n\n(⚠️ ပုံဖိုင်များ ရှာမတွေ့ပါ၊ Folder ထဲတွင် "nightfury1.jpg" နှင့် "nightfury2.jpg" ရှိမရှိ စစ်ဆေးပါ)',
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 KBZPay ဖြင့် ငွေချေမည်', 'pay_kpay_nightfury')]
      ])
    );
  }
});

// KPay Payment Handler - ထီးလိုမင်းလို ဘုရား (15,000 KS)
bot.action('pay_kpay_buddha', async (ctx) => {
  await ctx.answerCbQuery();
  const kpayMsg = '💳 **KBZPay Payment Details**\n\n' +
                  '📱 KPay Number: `09687880957`\n' +
                  '👤 Name: Phyo Wai Kyaw\n' +
                  '💰 Amount: 15,000 KS\n\n' +
                  '📌 "ငွေလွှဲနည်းလမ်း:"\n' +
                  '၁။ အထက်ပါ QR Code ကို Scan ဖတ်၍ဖြစ်စေ၊ ဖုန်းနံပါတ်သို့ဖြစ်စေ 15,000 KS လွှဲပေးပါ။\n' +
                  '၂။ ငွေလွှဲပြီးပါက Transaction Slip (စလစ်ပုံ) ကို Admin (@TharPhyo9) ထံ တိုက်ရိုက် ပို့ပေးပါ၊ Admin မှ 15 min အတွင်း STL ဖိုင် ပို့ပေးပါမည်။';

  try {
    await ctx.replyWithPhoto(
      { source: './kpay_qr.jpg' },
      { caption: kpayMsg, parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply(kpayMsg + '\n\n(⚠️ QR Code ပုံ ရှာမတွေ့ပါ၊ Folder ထဲတွင် "kpay_qr.jpg" ရှိမရှိ စစ်ဆေးပါ)', { parse_mode: 'Markdown' });
  }
});

// KPay Payment Handler - Night Fury (200 KS)
bot.action('pay_kpay_nightfury', async (ctx) => {
  await ctx.answerCbQuery();
  const kpayMsg = '💳 **KBZPay Payment Details**\n\n' +
                  '📱 KPay Number: `09687880957`\n' +
                  '👤 Name: Phyo Wai Kyaw\n' +
                  '💰 Amount: 200 KS\n\n' +
                  '📌 **ငွေလွှဲနည်းလမ်း:**\n' +
                  '၁။ အထက်ပါ QR Code ကို Scan ဖတ်၍ဖြစ်စေ၊ ဖုန်းနံပါတ်သို့ဖြစ်စေ 200 KS လွှဲပေးပါ။\n' +
                  '၂။ ငွေလွှဲပြီးပါက **Transaction Slip (စလစ်ပုံ)** ကို Admin (@TharPhyo9) ထံ တိုက်ရိုက် ပို့ပေးပါ၊ Admin မှ 15 min အတွင်း STL ဖိုင် ပို့ပေးပါမည်။';

  try {
    await ctx.replyWithPhoto(
      { source: './kpay_qr.jpg' },
      { caption: kpayMsg, parse_mode: 'Markdown' }
    );
  } catch (error) {
    await ctx.reply(kpayMsg + '\n\n(⚠️ QR Code ပုံ ရှာမတွေ့ပါ၊ Folder ထဲတွင် "kpay_qr.jpg" ရှိမရှိ စစ်ဆေးပါ)', { parse_mode: 'Markdown' });
  }
});

bot.launch()
  .then(() => {
    console.log('Ming Dhone Bot စတင်အလုပ်လုပ်နေပါပြီ...');
  })
  .catch((err) => {
    console.error('အမှားအယွင်းရှိနေပါသည်:', err);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
