const { Telegraf, Markup } = require('telegraf')
const { message } = require('telegraf/filters')
require('dotenv').config()
const text = require('./const')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply(`Здарова ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец'}!`))
bot.help((ctx) => ctx.reply(text.commands))
bot.command('course', async (ctx) => {
    try {
      await ctx.replyWithHTML('<b>Фархад иди в очко!</b>', Markup.inlineKeyboard([
        [Markup.button.callback('редакторы', 'btn_1'), Markup.button.callback('тест', 'btn_2')]
      ]));
    } catch (e) {
      console.error(e);
    }
  });

// Объект с информацией о каждом участнике
const participants = {};

// Функция для получения списка лидеров в порядке убывания накопленных очков
function getLeaders() {
  const leaders = Object.entries(participants).map(([userId, participant]) => ({
    userId,
    points: participant.points
  }));
  leaders.sort((a, b) => b.points - a.points);
  return leaders;
}

// Команда для получения очков и списка лидеров
bot.command('getpoints', (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  // Проверяем, есть ли участник в списке
  if (!participants[userId]) {
    participants[userId] = {
      username: ctx.from.username || 'Unknown',
      points: 0
    };
  }

  // Проверяем прошло ли достаточно времени с момента предыдущего получения очков
  if (!participants[userId].lastUpdated || (Date.now() - participants[userId].lastUpdated >= 24 * 60 * 60 * 1000)) {
    const points = getRandomPoints();
    participants[userId].points += points;
    participants[userId].lastUpdated = Date.now();

    ctx.reply(`Ты получил ${points} сладких палок, увидимся завтра. У тебя теперь ${participants[userId].points} очков.`);

    // Выводим обновленный список участников после добавления нового участника

    // Получаем список лидеров
    const leaders = getLeaders();

    // Выводим список лидеров
    const leadersList = leaders.map((leader, index) => `${index + 1}. @${participants[leader.userId].username}: ${leader.points} очков`).join('\n');
    ctx.reply(`Список лидеров:\n\n${leadersList}`);
  } else {
    ctx.reply('Куда торопишься, сладкий? Ты уже брал очко сегодня!');
  }
});
     //Список лидеров
bot.command('leaders', (ctx) => {
  const leaders = getLeaders();

  // Выводим список лидеров
  const leadersList = leaders.map((leader, index) => `${index + 1}. @${participants[leader.userId].username}: ${leader.points} очков`).join('\n');
  ctx.reply(`Список лидеров:\n\n${leadersList}`);
});

// Запуск бота
bot.launch();

// Функция для генерации случайного количества очков
function getRandomPoints() {
  return Math.floor(Math.random() * 16) - 5;
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))