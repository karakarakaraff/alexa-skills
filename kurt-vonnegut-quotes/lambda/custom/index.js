/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.19c3ce49-25a0-459e-b06e-cb2b243c13e2';

const languageStrings = {
    'en': {
        translation: {
            QUOTES: [
                'Everything was beautiful and nothing hurt.',
                'We are what we pretend to be, so we must be careful about what we pretend to be.',
                'I urge you to please notice when you are happy, and exclaim or murmur or think at some point, \"If this isn\'t nice, I don\'t know what is.\"',
                'I want to stay as close to the edge as I can without going over. Out on the edge you see all kinds of things you can\'t see from the center.',
                'I tell you, we are here on Earth to fart around, and don\'t let anybody tell you different.',
                'Those who believe in telekinetics, raise my hand.',
                'Laughter and tears are both responses to frustration and exhaustion. I myself prefer to laugh, since there is less cleaning up to do afterward.',
                'The arts are not a way to make a living. They are a very human way of making life more bearable. To practice any art, no matter how well or badly, is a way to make your soul grow, for heaven\'s sake.',
                'Sing in the shower. Dance to the radio. Tell stories. Write a poem to a friend, even a lousy poem. Do it as well as you possibly can. You will get an enormous reward. You will have created something.',
                'Hello, babies. Welcome to Earth. It\'s hot in the summer and cold in the winter. It\'s round and wet and crowded. On the outside, babies, you\'ve got a hundred years here. There\'s only one rule that I know of, babies: God damn it, you\'ve got to be kind.',
                'A purpose of human life, no matter who is controlling it, is to love whoever is around to be loved.',
                'We have to continually be jumping off cliffs and developing our wings on the way down.',
                'Being a Humanist means trying to behave decently without expectation of rewards or punishment after you are dead.',
                'The universe is a big place, perhaps the biggest.',
                'Many people need desperately to receive this message: \"I feel and think much as you do, care about many of the things you care about, although most people do not care about them. You are not alone.\"',
                'One of the few good things about modern times: If you die horribly on television, you will not have died in vain. You will have entertained us.',
                'Science is magic that works.',
                'And so it goes.',
                'Maturity is a bitter disappointment for which no remedy exists, unless laughter could be said to remedy anything.',
                'A sane person, to an insane society, must appear insane.',
                'If you can do no good, at least do no harm.',
                'Beware of the man who works hard to learn something, learns it, and finds himself no wiser than before.',
                'Do you realize that all great literature is all about what a bummer it is to be a human being? Isn\'t it such a relief to have somebody say that?',
                'Of all the words of mice and men, the saddest are, \"It might have been.\"',
                'Live by the harmless untruths that make you brave and kind and healthy and happy.',
                'There is love enough in this world for everybody, if people will just look.',
                'Wake up, you idiots! Whatever made you think that money was so valuable?',
                'We are healthy only to the extent that our ideas are humane.',
                'Just because you can read, write and do a little math, doesn\'t mean that you\'re entitled to conquer the universe.',
                'It is just an illusion here on Earth that one moment follows another one, like beads on a string, and that once a moment is gone, it is gone forever.',
                'If people think nature is their friend, then they sure don\'t need an enemy.',
                'It is a very mixed blessing to be brought back from the dead.',
                'Anything can make me stop and look and wonder, and sometimes learn.',
                'There is no reason why good cannot triumph as often as evil. The triumph of anything is a matter of organization. If there are such things as angels, I hope that they are organized along the lines of the Mafia.',
                'I was taught that the human brain was the crowning glory of evolution so far, but I think it\'s a very poor scheme for survival.',
                'New knowledge is the most valuable commodity on earth. The more truth we have to work with, the richer we become.',
                'If you can do a half-assed job of anything, you\'re a one-eyed man in a kingdom of the blind.',
                'A step backward, after making a wrong turn, is a step in the right direction.',
                'Another flaw in the human character is that everybody wants to build and nobody wants to do maintenance.',
                'Until you die, it\'s all life.',
                'Everything is nothing, with a twist.',
                'The truth is, we know so little about life, we don\'t really know what the good news is and what the bad news is.',
                'People need good lies. There are too many bad ones.',
                'All moments, past, present and future, always have existed, always will exist.',
                'Here we are, trapped in the amber of the moment. There is no why.',
                'You can\'t just eat good food. You\'ve got to talk about it, too. And you\'ve got to talk about it to somebody who understands that kind of food.',
                'I am eternally grateful for my knack of finding in great books, some of them very funny books, reason enough to feel honored to be alive, no matter what else might be going on.',
                'Plato says that the unexamined life is not worth living. But what if the examined life turns out to be a clunker as well?',
                'True terror is to wake up one morning and discover that your high school class is running the country.',
                'When I\'m dead, I\'m going to forget everything – and I advise you to do the same.',
            ],
            SKILL_NAME: 'Kurt Vonnegut Quotes',
            GET_QUOTE_MESSAGE: "Kurt Vonnegut once said, ",
            HELP_MESSAGE: 'You can say tell me a quote, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetQuote');
    },
    'GetNewQuoteIntent': function () {
        this.emit('GetQuote');
    },
    'GetQuote': function () {
        // Get a random quote from the Kurt Vonnegut quotes list
        // Use this.t() to get corresponding language data
        const quoteArr = this.t('QUOTES');
        const quoteIndex = Math.floor(Math.random() * quoteArr.length);
        const randomQuote = quoteArr[quoteIndex];

        // Create speech output
        const speechOutput = this.t('GET_QUOTE_MESSAGE') + randomQuote;
        this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), randomQuote);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
