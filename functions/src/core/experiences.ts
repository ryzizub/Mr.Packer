import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const makeExperienceList = functions.firestore.document('experiences/{documentId}').onCreate(async (snap) => {
    const data = snap.data();
    if (data !== null && data !== undefined) {
        if (data.name !== null && data !== undefined) {
            return updateExperienceList(data.name);
        }
    }
    return false;
});

async function updateExperienceList(newExp: string) {
    const experiences = await admin.database().ref('experiences').once('value');
    if (experiences.exists()) {
        const vale = experiences.val();
        vale.push(newExp);
        return admin.database().ref('experiences').set(vale);
    } else {
        return admin.database().ref('experiences').set([newExp]);
    }
}


export async function loadExperiences(): Promise<string[]> {
    const experiences = await admin.database().ref('experiences').once('value');
    if (experiences.exists()) {
        return experiences.val();
    } else {
        return [];
    }
}

export async function checkAndUpdateExperiences(name: string) {
    const experiences = await loadExperiences();
    if (experiences.indexOf(name) === -1) {
        return admin.firestore().collection('experiences').add({
            name: name
        });
    } else {
        return null;
    }
}