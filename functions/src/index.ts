import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { dialogflow, DialogflowConversation, Suggestions } from "actions-on-google";
import Duration from "./interfaces/duration";
import * as expCore from "./core/experiences";
import * as bagCore from "./core/bag";

admin.initializeApp();
const app: any = dialogflow();

app.intent("Default Welcome Intent", (conv: DialogflowConversation) => {
    conv.ask(`Greetings! How can I assist?`);
    conv.ask(new Suggestions(['Help me pack for my trip']))
});

app.intent('trip-starter', (conv: DialogflowConversation) => {
    conv.ask('For how many days are you going?');
    conv.ask(new Suggestions(['1 day', '3 days', '1 week', '2 weeks', '1 month']));
});

app.intent('days', (conv: DialogflowConversation, { duration, number }: { duration: Duration, number: number }) => {
    if (duration === undefined || number === undefined) {
        conv.ask("I don't get for how many days are you going?")
    }
    let days = 0;
    if (duration.unit === undefined) {
        days = number;
    } else {
        if (duration.unit === 'day') {
            days = duration.amount;
        }
        if (duration.unit === 'year') {
            days = duration.amount * 365;
        }
        if (duration.unit === 'month') {
            days = duration.amount * 30;
        }
        if (duration.unit === 'wk') {
            days = duration.amount * 7;
        }
    }
    if (days === 0) {
        conv.ask("I can't help you with trip shorter than 1 day. Probably take some beers and 1 pair of socks.");
        conv.close("Thank you, I can't wait for your next trip");
    } else {
        conv.ask(`You are going for ${days} days. Right?`);
        conv.user.storage.days = days;
        conv.ask(new Suggestions(['Yes', 'No']));
    }
});

app.intent('days - yes', async (conv: DialogflowConversation) => {
    conv.ask('What are you going to do there?');
    const exp = await expCore.loadExperiences();
    conv.ask(new Suggestions(exp));
});

app.intent('experience', async (conv: DialogflowConversation, { experience }: { experience: any }) => {
    if (experience !== null && experience !== undefined) {
        conv.user.storage.experience = experience;
        let response = null;
        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            response = await bagCore.countMyList(conv.user.storage.days, experience);
        } else {
            response = await bagCore.countMyResponse(conv.user.storage.days, experience);
        }
        conv.ask("Awesome! Thats nice. Take these things.");
        conv.ask(response);
        await expCore.checkAndUpdateExperiences(experience);
        conv.ask("Can I help you again?");
    } else {
        conv.ask('I dont understand you. What are you going to do there?');
        const exp = await expCore.loadExperiences();
        conv.ask(new Suggestions(exp));
    }
});


app.intent('experience - yes',  async (conv: DialogflowConversation) => {
    conv.user.storage.days = null;
    conv.user.storage.experience = null;
    conv.ask('For how many days are you going?');
    conv.ask(new Suggestions(['1 day', '3 days', '1 week', '2 weeks', '1 month']));
});


export const fulfillment = functions.https.onRequest(app);
export const makeExperienceList = expCore.makeExperienceList;