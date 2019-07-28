/* eslint-disable  func-names */
/* eslint-disable  dot-notation */
/* eslint-disable  new-cap */
/* eslint quote-props: ['error', 'consistent']*/

'use strict';

const Alexa = require('alexa-sdk');

const ANSWER_COUNT = 4; // The number of possible answers per trivia question.
const GAME_LENGTH = 11; // The number of questions per trivia game.
const GAME_STATES = {
  TRIVIA: '_TRIVIAMODE', // Asking trivia questions.
  START: '_STARTMODE', // Entry point, start the game.
  HELP: '_HELPMODE', // The user is asking for help.
};
const APP_ID = 'amzn1.ask.skill.767c4b14-472d-41b5-92fa-499f851d409e';

const languageString = {
  'en': {
    'translation': {
      'QUESTIONS': [
        {
          'Before getting the title \"Stranger Things,\" what was the series originally going to be called?': [
            'Montauk',
            'The Nether',
            '<phoneme alphabet="ipa" ph="dɛm ə gȯr gən">Demogorgon</phoneme> Darkness',
            'Time Skip',
            'The Party and the Mage',
            'The Flea and the Acrobat',
            'The Weirdo on Maple Street',
            'The Gate',
          ],
        },
        {
          'Where is Hawkins located?': [
            'Indiana',
            'Illinois',
            'Michigan',
            'Ohio',
            'Kansas',
            'Oregon',
          ],
        },
        {
          'What is Will\'s mom\'s name?': [
            'Joyce',
            'Susan',
            'Karen',
            'Kimberly',
            'Terry',
            'Linda',
          ],
        },
        {
          'What is Chief Hopper\'s first name?': [
            'Jim',
            'Richard',
            'Howard',
            'James',
            'Kevin',
            'Robert',
          ],
        },
        {
          'Eleven called Dr. Brenner, <emphasis level="strong">Papa</emphasis>, and, <emphasis level="strong">Bad Man</emphasis>. But what is Dr. Brenner\'s first name?': [
            'Martin',
            'Mark',
            'Papa',
            'Michael',
            'Thomas',
            'David',
          ],
        },
        {
          'Which club do the boys belong to at school?': [
            'the <say-as interpret-as="spell-out">AV</say-as> club',
            'the chess club',
            'the science club',
            'the literature club',
          ],
        },
        {
          'What is Lucas\'s sister\'s name?': [
            'Erica',
            'Emma',
            'Emily',
            'Ella',
            'Erin',
            'Elise',
          ],
        },
        {
          'What happened to Hopper\'s daughter?': [
            'She died of cancer',
            'She was killed by doctors in the lab',
            'She went to live with her mom',
            'She died in a car crash',
          ],
        },
        {
          'Which of the boys curses the most?': [
            'Dustin',
            'Mike',
            'Lucas',
            'Will',
          ],
        },
        {
          'What is Eleven\'s main power?': [
            'telekinesis',
            'telepathy',
            'superhuman speed',
            'superhuman strength',
            'ability to fly',
            'teleportation',
          ],
        },
        {
          'In what decade is Stranger Things set?': [
            '1980s',
            '1970s',
            '1990s',
            '1960s',
          ],
        },
        {
          'What is the name of the first episode in season one?': [
            'The Vanishing of Will Byers',
            'The Flea and the Acrobat',
            'The Monster',
            'The Weirdo on Maple Street',
          ],
        },
        {
          'What is the name of the final episode in season one?': [
            'The Upside Down',
            'The Bathtub',
            'The Monster',
            'The Body',
            'Holly, Jolly',
            'The Flea and the Acrobat',
          ],
        },
        {
          'In season one, what night did Will go missing?': [
            'November 6th',
            'October 31st',
            'November 1st',
            'December 12th',
          ],
        },
        {
          'In season one, how long was Will in the Upside Down?': [
            '7 days',
            '10 days',
            '1 day',
            '2 days',
          ],
        },
        {
          'In season one, who opened the gate to the Upside Down?': [
            'Eleven',
            'Dr. Brenner',
            'a <phoneme alphabet="ipa" ph="dɛm ə gȯr gən">demogorgon</phoneme>',
            'the four boys with their Dungeons and Dragons game',
            'the shadow monster',
            'workers in the laboratory',
          ],
        },
        {
          'What board game do the boys like to play together?': [
            'Dungeons and Dragons',
            'Mouse Trap',
            'Candy Land',
            'Monopoly',
            'Chess',
            'Risk',
          ],
        },
        {
          'What is the name of Will\'s wizard character in Dungeons and Dragons?': [
            'Will the Wise',
            'Will the Weapon',
            'Will the Wanderer',
            'Will the Wicked',
          ],
        },
        {
          'In season one, what is Jonathan\'s hobby?': [
            'photography',
            'spray painting',
            'writing',
            'playing guitar',
            'playing board games',
            'building model planes',
          ],
        },
        {
          'In season one, which day of the week did Nancy and Barb go to the party?': [
            'Tuesday',
            'Monday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
        },
        {
          'In season one, what does the laboratory disguise itself as?': [
            'The Department of Energy',
            'The Department of Defense',
            'The Department of Health and Human Services',
            'The Department of Homeland Security',
            'a military base',
            'a post office',
          ],
        },
        {
          'In season one, who gives Eleven the nickname <emphasis level="strong">\"El?\"</emphasis>': [
            'Mike',
            'Dustin',
            'Lucas',
            'Will',
          ],
        },
        {
          'In season one, what is Mike and Eleven\'s go-to insult?': [
            'mouthbreather',
            'egg head',
            'smell monster',
            'freak',
            'zombie boy',
          ],
        },
        {
          'In season one, what was Barb sitting on when she was taken by the <phoneme alphabet="ipa" ph="dɛm ə gȯr gən">demogorgon</phoneme>?': [
            'a diving board',
            'a pool chair',
            'the hood of her car',
            'a beach towel',
          ],
        },
        {
          'In season one, what color is Eleven\'s dress?': [
            'pink',
            'white',
            'yellow',
            'light blue',
            'navy',
            'dark green',
          ],
        },
        {
          'In season one, what song do Will and Jonathan bond over?': [
            'Should I Stay Or Should I Go',
            'God Save The Queen',
            'Paint It Black',
            'Don\'t Stop Believin\'',
            'Space Oddity',
            'Every Breath You Take',
          ],
        },
        {
          'In season one, where is Will\'s birthmark that Joyce asks to see?': [
            'on his right arm',
            'on the back of his head',
            'on his right leg',
            'on his left hand',
            'on his left shoulder',
            'on his right hip',
          ],
        },
        {
          'In season one, what colors are the stripes on Eleven\'s tube socks?': [
            'green and yellow',
            'blue and yellow',
            'red and yellow',
            'red and blue',
            'black and green',
            'black and red',
          ],
        },
        {
          'In season one, who was supposed to do Will\'s autopsy but didn\'t?': [
            'Gary',
            'Hopper',
            'A scientist from the lab',
            'Mr. Clark',
          ],
        },
        {
          'What is the name of the first episode in season two?': [
            'Madmax',
            'Trick or Treat, Freak',
            'The Pollywog',
            'The Spy',
            'The Mind Flayer',
            'The Gate',
          ],
        },
        {
          'What is the name of the final episode in season two?': [
            'The Gate',
            'The Mind Flayer',
            'The Lost Sister',
            'The Spy',
            'The Pollywog',
          ],
        },
        {
          'In season two, how does Hopper convince Eleven to leave her room at the cabin?': [
            'He makes a triple decker Eggo extravaganza',
            'He turns on the TV',
            'He turns on some music and starts dancing',
            'He uses a secret knock',
          ],
        },
        {
          'In season two, what message does Will send using morse code?': [
            'Close gate',
            'Run',
            'Help me',
            'Beware',
            'It\'s not safe',
            'It\'s cold',
          ],
        },
        {
          'In season two, what do Barb\'s parents serve Nancy and Steve for dinner?': [
            'KFC',
            'McDonald\'s',
            'Burger King',
            'Taco Bell',
            'Leftovers',
            'Pizza Hut pizza',
          ],
        },
        {
          'In season two, what is Eleven\'s name on her new birth certificate?': [
            'Jane Hopper',
            'Jane Brenner',
            'Jane Wheeler',
            'Jane Byers',
          ],
        },
        {
          'In season two, how can Dustin tell which <phoneme alphabet="ipa" ph="dɛm ə dɑg">demodog</phoneme> is Dart?': [
            'the yellow stripe on his back',
            'the yellow spot on his head',
            'the red stripe on his head',
            'the green spot on his foot',
            'the size of his head',
            'the size of his tail',
          ],
        },
        {
          'In season two, who dances with Dustin at the Snow Ball?': [
            'Nancy',
            'Tina',
            'Stacy',
            'Max',
          ],
        },
        {
          'In season two, what computer language does Bob know?': [
            'Basic',
            'Java',
            'Pascal',
            'HTML',
          ],
        },
        {
          'In season two, which Ghostbuster is Lucas for Halloween?': [
            'Peter Venkman',
            'Ray Stantz',
            'Egon Spengler',
            'Winston Zeddemore',
          ],
        },
        {
          'In season two, where does Eleven\'s sister live?': [
            'Chicago',
            'New York',
            'Los Angeles',
            'Denver',
            'Miami',
            'Portland',
          ],
        },
        {
          'In season two, what does Dart kill and eat?': [
            'Dustin\'s mom\'s cat',
            'the neighbor\'s small dog',
            'a bird in the yard',
            'Dustin\'s turtle',
            'a rat in the basement',
          ],
        },
        {
          'In season two, what does Eleven\'s sister ask her to move?': [
            'a train',
            'a car',
            'a dumpster',
            'a van',
            'a television',
            'a glass of water',
          ],
        },
        {
          'In season two, in what arcade game does Max beat Dustin\'s high score?': [
            'Dig Dug',
            'Pacman',
            'Donkey Kong',
            'Time Pilot',
            'Tetris',
            'Defender',
          ],
        },
        {
          'In season two, what is Eight\'s real name?': [
            'Kali',
            'Kerry',
            'Kara',
            'Kenzie',
            'Katie',
            'Kelly',
          ],
        },
        {
          'In season two, Eleven\'s mom mumbles several things in a loop. What is <emphasis level="strong">not</emphasis> included in that loop?': [
            'butterfly',
            'breathe',
            'sunflower',
            'rainbow',
            'three to the right',
            'four fifty',
          ],
        },
        {
          'In season two, what does Murray Bauman, the private investigator, drink?': [
            'vodka',
            'red wine',
            'whiskey',
            'rum',
            'tequila',
          ],
        },
        {
          'In season two, how does Max refer to the boys?': [
            'stalkers',
            'creepers',
            'freaks',
            'weirdos',
          ],
        },
        {
          'In season two, where does Bob want to move?': [
            'Maine',
            'Vermont',
            'New Hampshire',
            'Pennsylvania',
            'Florida',
            'Arizona',
          ],
        },
        {
          'How many people watched \"Stranger Things 2\" in its first three days?': [
            '8,000,000',
            '2,000,000',
            '300,000',
            '5,000,000',
            '500,000',
            '80,000',
          ],
        },
        {
          'What is the name of the first episode in season three?': [
            'Suzie, Do You Copy?',
            'The Mall Rats',
            'The Case of the Missing Lifeguard',
            'The Flayed',
          ],
        },
        {
          'What is the name of the final episode in season three?': [
            'The Battle of Star Court',
            'The Bite',
            'Suzie, Do You Copy?',
            'The Flayed',
          ],
        },
        {
          'In season three, what is the name of the ice cream parlor where Steve works?': [
            'Scoops Ahoy',
            'Pirate Cove',
            'Sail Away',
            'Sailor\'s Choice',
          ],
        },
        {
          'In season three, who is Dustin\'s girlfriend?': [
            'Suzie',
            'Sarah',
            'Stacy',
            'Sammy',
          ],
        },
        {
          'In season three, where does Dustin build his radio antenna?': [
            'on top of a big hill',
            'on top of the mall',
            'in his basement',
            'at the fair grounds',
          ],
        },
        {
          'In season three, Billy has a happy memory of his mom. Where is his mom in this memory?': [
            'at a beach in California',
            'at the mall',
            'on a ferris wheel',
            'at a beach in Florida',
          ],
        },
        {
          'In season three, what is the name of the summer camp where Dustin went?': [
            'Camp Know Where',
            'Camp Super Science',
            'Camp Get Along',
            'Camp This And That',
          ],
        },
        {
          'In season three, who is Steve\'s coworker?': [
            'Robin',
            'Erica',
            'Rebecca',
            'Joyce',
          ],
        },
        {
          'In season three, what is the name of the woman who finds rats in her basement?': [
            'Mrs. Driscoll',
            'Mrs. Davis',
            'Mrs. Dixon',
            'Mrs. Duncan',
          ],
        },
        {
          'In season three, what does Erica want for going into the duct system?': [
            'free ice cream for life',
            'a My Little Ponies backpack',
            'a banana split with extra fudge',
            'a shopping spree in the mall',
          ],
        },
        {
          'In season three, what is the license plate on the yellow car that Hopper steals?': [
            'Tod Father',
            'Mellow Yellow',
            'Going Gone',
            'Dad Jokes',
          ],
        },
        {
          'In season three, what is the name of the mall?': [
            'Star Court',
            'Star Central',
            'Central City',
            'Hawkins Plaza',
          ],
        },
        {
          'In season three, what song does Dustin sing with his girlfriend?': [
            'NeverEnding Story',
            'Never Surrender',
            'Strike Zone',
            'Cold As Ice',
          ],
        },
        {
          'In season three, what movie do the kids sneak into when they\'re escaping the Russians?': [
            'Back to the Future',
            'Day of the Dead',
            'The NeverEnding Story',
            'Firestarter',
          ],
        },
        {
          'In season three, the Russians use a secret code. Which of these phrases is part of the code?': [
            'the silver cat feeds',
            'the black cat eats',
            'the silver fox creeps',
            'the golden goose sleeps',
          ],
        },
        {
          'In season three, the Russians use a secret code. Which of these phrases is part of the code?': [
            'a trip to China sounds nice',
            'nlue meets green in the east',
            'the days are long',
            'the silver fox feeds',
          ],
        },
        {
          'In season two and three, what car does Billy drive?': [
            'Camaro',
            'Mustang',
            'BMW',
            'Blazer',
            'Thunderbird',
          ],
        },
        {
          'In season three, what flavor of Slurpee does Alexei want?': [
            'cherry',
            'strawberry',
            'blue raspberry',
            'orange',
            'kiwi',
          ],
        },
        {
          'In season three, what carnival ride are Joyce and Hopper riding when they hold hands?': [
            'the Gravitron',
            'the Roll-O-Plane',
            'the Silver Streak',
            'the Scrambler',
            'the Tilt-A-Whirl',
            'the Paratrooper',
            'the Fun Slide',
          ],
        },
        {
          'What color balloons does Alexei pop to win the Woody Woodpecker stuffed toy at the carnival?': [
            'green',
            'red',
            'orange',
            'yellow',
            'blue',
            'purple',
            'pink',
          ],
        },
        {
          'In season three, where does Suzie live?': [
            'Salt Lake City',
            'Hawkins',
            'New York City',
            'San Francisco',
            'Chicago',
            'Miami',
            'London',
          ],
        },
      ],
      'GAME_NAME': 'Stranger Things Trivia',
      'HELP_MESSAGE': 'I will ask you %s multiple choice questions. Respond with the number of the answer. ' +
        'For example, say one, two, three, or four. To start a new game at any time, say, start over. ',
      'REPEAT_QUESTION_MESSAGE': 'To repeat the last question, say, repeat. ',
      'ASK_MESSAGE_START': 'Would you like to start playing?',
      'HELP_REPROMPT': 'To give an answer to a question, respond with the number of the answer. ',
      'STOP_MESSAGE': 'Would you like to keep playing?',
      'CANCEL_MESSAGE': 'Ok, let\'s play again soon.',
      'NO_MESSAGE': 'Ok, we\'ll play another time. Goodbye!',
      'TAKE_A_GUESS': 'Go ahead, say a number between 1 and %s',
      'TRIVIA_UNHANDLED': 'Try saying a number between 1 and %s',
      'HELP_UNHANDLED': 'Say yes to continue, or no to end the game.',
      'START_UNHANDLED': 'Say start over to start a new game.',
      'NEW_GAME_MESSAGE': 'Welcome to the new %s. ',
      'WELCOME_MESSAGE': 'I will ask you %s questions, try to get as many right as you can. ' +
        'Just say the number of the answer. Let\'s begin. ',
      'NOT_VALID_GUESS': 'That\'s not a number between 1 and %s. Please try again.',
      'ANSWER_CORRECT_MESSAGE': 'correct. ',
      'ANSWER_WRONG_MESSAGE': 'wrong. ',
      'CORRECT_ANSWER_MESSAGE': 'The correct answer is %s: %s. ',
      'ANSWER_IS_MESSAGE': 'That answer is ',
      'TELL_QUESTION_MESSAGE': '<break time="1s"/>Question %s: %s ',
      'GAME_OVER_MESSAGE': 'Your final score is %s. Thank you for playing! If you play again, I\'ll give you a new set of questions.',
      'SCORE_IS_MESSAGE': 'Your score is %s. ',
    },
  },
};

const newSessionHandlers = {
  'LaunchRequest': function() {
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame', true);
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame', true);
  },
  'AMAZON.HelpIntent': function() {
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser', true);
  },
  'AMAZON.FallbackIntent': function() {
    const speechOutput = this.t('START_UNHANDLED');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    const speechOutput = this.t('START_UNHANDLED');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
};

function populateGameQuestions(translatedQuestions) {
  const gameQuestions = [];
  const indexList = [];
  let index = translatedQuestions.length;

  if (GAME_LENGTH > index) {
    throw new Error('Invalid Game Length.');
  }

  for (let i = 0; i < translatedQuestions.length; i++) {
    indexList.push(i);
  }

  // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
  for (let j = 0; j < GAME_LENGTH; j++) {
    const rand = Math.floor(Math.random() * index);
    index -= 1;

    const temp = indexList[index];
    indexList[index] = indexList[rand];
    indexList[rand] = temp;
    gameQuestions.push(indexList[index]);
  }

  return gameQuestions;
}

/**
 * Get the answers for a given question, and place the correct answer at the spot marked by the
 * correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
 * only ANSWER_COUNT will be selected.
 * */
function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
  const answers = [];
  const answersCopy = translatedQuestions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(translatedQuestions[gameQuestionIndexes[correctAnswerIndex]])[0]].slice();
  let index = answersCopy.length;

  if (index < ANSWER_COUNT) {
    throw new Error('Not enough answers for question.');
  }

  // Shuffle the answers, excluding the first element which is the correct answer.
  for (let j = 1; j < answersCopy.length; j++) {
    const rand = Math.floor(Math.random() * (index - 1)) + 1;
    index -= 1;

    const swapTemp1 = answersCopy[index];
    answersCopy[index] = answersCopy[rand];
    answersCopy[rand] = swapTemp1;
  }

  // Swap the correct answer into the target location
  for (let i = 0; i < ANSWER_COUNT; i++) {
    answers[i] = answersCopy[i];
  }
  const swapTemp2 = answers[0];
  answers[0] = answers[correctAnswerTargetLocation];
  answers[correctAnswerTargetLocation] = swapTemp2;
  return answers;
}

function isAnswerSlotValid(intent) {
    const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    const answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value, 10));
    return answerSlotIsInt
        && parseInt(intent.slots.Answer.value, 10) < (ANSWER_COUNT + 1)
        && parseInt(intent.slots.Answer.value, 10) > 0;
}

function handleUserGuess(userGaveUp) {
  var userGuess = this.event.request.intent.slots.Answer.value;
  const answerSlotValid = isAnswerSlotValid(this.event.request.intent);
  let speechOutput = '';
  let speechOutputAnalysis = '';
  const gameQuestions = this.attributes.questions;
  let correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex, 10);
  let currentScore = parseInt(this.attributes.score, 10);
  let currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex, 10);
  const correctAnswerText = this.attributes.correctAnswerText;
  const translatedQuestions = this.t('QUESTIONS', {keySeparator: '#'});

  if (parseInt(this.event.request.intent.slots.Answer.value, 10) > 0 && parseInt(this.event.request.intent.slots.Answer.value, 10) < (ANSWER_COUNT + 1)) {
    if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value, 10) === this.attributes['correctAnswerIndex']) {
      currentScore++;
      speechOutputAnalysis = this.t('ANSWER_CORRECT_MESSAGE');
    } else {
      if (!userGaveUp) {
          speechOutputAnalysis = this.t('ANSWER_WRONG_MESSAGE');
      }

      speechOutputAnalysis += this.t('CORRECT_ANSWER_MESSAGE', correctAnswerIndex, correctAnswerText);
    }
  } else {
    const speechOutput = this.t('NOT_VALID_GUESS', ANSWER_COUNT.toString());
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  }

  // Check if we can exit the game session after GAME_LENGTH questions (zero-indexed)
  if (this.attributes['currentQuestionIndex'] === GAME_LENGTH - 1) {
    speechOutput = 'You guessed ' + userGuess + '. ';
    speechOutput += userGaveUp ? '' : this.t('ANSWER_IS_MESSAGE');
    speechOutput += speechOutputAnalysis + this.t('GAME_OVER_MESSAGE', currentScore.toString());

    this.response.speak(speechOutput);
    this.emit(':responseReady');
  } else {
    currentQuestionIndex += 1;
    correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
    const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
    const roundAnswers = populateRoundAnswers.call(this, gameQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
    const questionIndexForSpeech = currentQuestionIndex + 1;
    // Strip SSML tags from card
    var regex = /(<([^>]+)>)/ig;
    let repromptText = this.t('TELL_QUESTION_MESSAGE', questionIndexForSpeech.toString(), spokenQuestion);

    for (let i = 0; i < ANSWER_COUNT; i++) {
      repromptText += `${i + 1}. ${roundAnswers[i]}. `;
    }

    speechOutput += 'You guessed ' + userGuess + '. ';
    speechOutput += userGaveUp ? '' : this.t('ANSWER_IS_MESSAGE');
    speechOutput += speechOutputAnalysis + this.t('SCORE_IS_MESSAGE', currentScore.toString()) + repromptText;

    Object.assign(this.attributes, {
      'speechOutput': repromptText,
      'repromptText': repromptText,
      'currentQuestionIndex': currentQuestionIndex,
      'correctAnswerIndex': correctAnswerIndex + 1,
      'questions': gameQuestions,
      'score': currentScore,
      'correctAnswerText': translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0],
    });

    this.response.speak(speechOutput).listen(repromptText);
    this.response.cardRenderer(this.t('GAME_NAME'), repromptText.replace(regex, ""));
    this.emit(':responseReady');
  }
}

const startStateHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
  'StartGame': function(newGame) {
    let speechOutput = newGame ? this.t('NEW_GAME_MESSAGE', this.t('GAME_NAME')) + this.t('WELCOME_MESSAGE', GAME_LENGTH.toString()) : '';
    // Select GAME_LENGTH questions for the game
    const translatedQuestions = this.t('QUESTIONS', {keySeparator: '#'});
    const gameQuestions = populateGameQuestions(translatedQuestions);
    // Generate a random index for the correct answer, from 0 to 3
    const correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
    // Select and shuffle the answers for each question
    const roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex, translatedQuestions);
    const currentQuestionIndex = 0;
    const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
    // Strip SSML tags from card
    var regex = /(<([^>]+)>)/ig;
    let repromptText = this.t('TELL_QUESTION_MESSAGE', '1', spokenQuestion);

    for (let i = 0; i < ANSWER_COUNT; i++) {
      repromptText += `${i + 1}. ${roundAnswers[i]}. `;
    }

    speechOutput += repromptText;

    Object.assign(this.attributes, {
      'speechOutput': repromptText,
      'repromptText': repromptText,
      'currentQuestionIndex': currentQuestionIndex,
      'correctAnswerIndex': correctAnswerIndex + 1,
      'questions': gameQuestions,
      'score': 0,
      'correctAnswerText': translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0],
    });

    // Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
    this.handler.state = GAME_STATES.TRIVIA;

    this.response.speak(speechOutput).listen(repromptText);
    this.response.cardRenderer(this.t('GAME_NAME'), repromptText.replace(regex, ""));
    this.emit(':responseReady');
  },
});

const triviaStateHandlers = Alexa.CreateStateHandler(GAME_STATES.TRIVIA, {
  'GetAnswerIntent': function() {
    handleUserGuess.call(this, false);
  },
  'DontKnowIntent': function() {
    const speechOutput = this.t('TAKE_A_GUESS', ANSWER_COUNT.toString());
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame', false);
  },
  'AMAZON.RepeatIntent': function() {
    this.response.speak(this.attributes['speechOutput']).listen(this.attributes['repromptText']);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser', false);
  },
  'AMAZON.StopIntent': function() {
    this.handler.state = GAME_STATES.HELP;
    const speechOutput = this.t('STOP_MESSAGE');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(this.t('CANCEL_MESSAGE'));
    this.emit(':responseReady');
  },
  'AMAZON.FallbackIntent': function() {
    const speechOutput = this.t('TRIVIA_UNHANDLED', ANSWER_COUNT.toString());
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    const speechOutput = this.t('TRIVIA_UNHANDLED', ANSWER_COUNT.toString());
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    console.log(`Session ended in trivia state: ${this.event.request.reason}`);
  },
});

const helpStateHandlers = Alexa.CreateStateHandler(GAME_STATES.HELP, {
  'helpTheUser': function(newGame) {
    const askMessage = newGame ? this.t('ASK_MESSAGE_START') : this.t('REPEAT_QUESTION_MESSAGE') + this.t('STOP_MESSAGE');
    const speechOutput = this.t('HELP_MESSAGE', GAME_LENGTH) + askMessage;
    const repromptText = this.t('HELP_REPROMPT') + askMessage;

    this.response.speak(speechOutput).listen(repromptText);
    this.emit(':responseReady');
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame', false);
  },
  'AMAZON.RepeatIntent': function() {
    const newGame = !(this.attributes['speechOutput'] && this.attributes['repromptText']);
    this.emitWithState('helpTheUser', newGame);
  },
  'AMAZON.HelpIntent': function() {
    const newGame = !(this.attributes['speechOutput'] && this.attributes['repromptText']);
    this.emitWithState('helpTheUser', newGame);
  },
  'AMAZON.YesIntent': function() {
    if (this.attributes['speechOutput'] && this.attributes['repromptText']) {
      this.handler.state = GAME_STATES.TRIVIA;
      this.emitWithState('AMAZON.RepeatIntent');
    } else {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('StartGame', false);
    }
  },
  'AMAZON.NoIntent': function() {
    const speechOutput = this.t('NO_MESSAGE');
    this.response.speak(speechOutput);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function() {
    const speechOutput = this.t('STOP_MESSAGE');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(this.t('CANCEL_MESSAGE'));
    this.emit(':responseReady');
  },
  'AMAZON.FallbackIntent': function() {
    const speechOutput = this.t('HELP_UNHANDLED');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    const speechOutput = this.t('HELP_UNHANDLED');
    this.response.speak(speechOutput).listen(speechOutput);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    console.log(`Session ended in help state: ${this.event.request.reason}`);
  },
});

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.resources = languageString;
  alexa.registerHandlers(newSessionHandlers, startStateHandlers, triviaStateHandlers, helpStateHandlers);
  alexa.execute();
};
