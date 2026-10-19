const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8956976675:AAGIR3PZFUAKD6iF8FEiFO2oV6pLEBXCAYU');

// Global Error Handler
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

// ၁။ Main Menu ခလုတ်
bot.hears('🏠 Main Menu', async (ctx) => {
  ctx.reply(
    '💎PREMIUM MODELS💎',
    Markup.inlineKeyboard([
      [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
      [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')] // 👈 Item အသစ် ထည့်ထားပါသည်
    ])
  );
});

// ၂။ Contact Admin ခလုတ်
bot.hears('📞 Contact Admin', async (ctx) => {
  ctx.reply('📞 အသေးစိတ် မေးမြန်းလိုပါက Admin (@TharPhyo9) ထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။');
});

// ၃။ ရှေ့သို့ ခလုတ်
bot.hears(/>>>|ရှေ့သို့/, async (ctx) => {
  ctx.reply(
    '➡️ ပင်မ မီနူးသို့ ပြန်ရောက်ပါပြီ -',
    Markup.inlineKeyboard([
      [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
      [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')]
    ])
  );
});

// ၄။ နောက်သို့ ခလုတ်
bot.hears(/<<<|နောက်သို့/, async (ctx) => {
  ctx.reply(
    '⬅️ ပင်မ မီနူးသို့ ပြန်ရောက်ပါပြီ -',
    Markup.inlineKeyboard([
      [Markup.button.callback('🟢 ထီးလိုမင်းလို ဘုရား — 15,000 KS', 'buy_buddha')],
      [Markup.button.callback('🐉 Night Fury — 200 KS', 'buy_nightfury')]
    ])
  );
});

// --- Callback Handlers ---

// ၁။ ထီးလိုမင်းလို ဘုရား
bot.action('buy_buddha', async (ctx) => {
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
    console.error('Buddha Photo Error:', error);
    await ctx.reply('⚠️ ပုံဖိုင်များ ရှာမတွေ့ပါ။ Folder ထဲတွင် "buddha1.jpg" နှင့် "buddha2.jpg" ပုံများ ရှိမရှိ စစ်ဆေးပါ။');
  }
});

// ၂။ Night Fury (Item အသစ်)
bot.action('buy_nightfury', async (ctx) => {
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
    console.error('Night Fury Photo Error:', error);
    await ctx.reply('⚠️ ပုံဖိုင်များ ရှာမတွေ့ပါ။ Folder ထဲတွင် "nightfury1.jpg" နှင့် "nightfury2.jpg" ပုံများ ရှိမရှိ စစ်ဆေးပါ။');
  }
});

// KBZPay Payment - Buddha (15,000 KS)
bot.action('pay_kpay_buddha', async (ctx) => {
  await sendKPayDetails(ctx, '15,000 KS');
});

// KBZPay Payment - Night Fury (200 KS)
bot.action('pay_kpay_nightfury', async (ctx) => {
  await sendKPayDetails(ctx, '200 KS');
});

// KPay အချက်အလက်ပြသပေးသည့် ဘုံ Function
async function sendKPayDetails(ctx, price) {
  const captionText = '💳 **KBZPay Payment Details**\n\n' +
                      '📱 KPay Number: `09687880957`\n' +
                      '👤 Name: Phyo Wai Kyaw\n' +
                      `💰 Amount: ${price}\n\n` +
                      '📌 **ငွေလွှဲနည်းလမ်း:**\n' +
                      `၁။ အထက်ပါ QR Code ကို Scan ဖတ်၍ဖြစ်စေ၊ ဖုန်းနံပါတ်သို့ဖြစ်စေ ${price} လွှဲပေးပါ။\n` +
                      '၂။ ငွေလွှဲပြီးပါက **Transaction Slip (စလစ်ပုံ)** ကို Admin (@TharPhyo9) ထံ တိုက်ရိုက် ပို့ပေးပါ၊ Admin မှ 60 min အတွင်း STL ဖိုင် ပို့ပေးပါမည်။';

  try {
    await ctx.replyWithPhoto(
      { source: './kpay_qr.jpg' },
      {
        caption: captionText,
        parse_mode: 'Markdown'
      }
    );
  } catch (error) {
    console.error('KPay Photo Error:', error);
    await ctx.reply(
      captionText + '\n\n(⚠️ QR Code ပုံ ရှာမတွေ့ပါ၊ Folder ထဲတွင် "kpay_qr.jpg" ရှိမရှိ စစ်ဆေးပါ)',
      { parse_mode: 'Markdown' }
    );
  }
}

bot.launch()
  .then(() => {
    console.log('Ming Dhone Bot စတင်အလုပ်လုပ်နေပါပြီ...');
  })
  .catch((err) => {
    console.error('အမှားအယွင်းရှိနေပါသည်:', err);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));