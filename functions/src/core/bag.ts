import { List } from "actions-on-google";
import Bag from "../interfaces/bag";
import * as admin from "firebase-admin";

export async function countMyList(days: any, experience: any): Promise<string> {
    let bag = await countMyBag(days, experience);
    if (bag === null){
        return "Missing data...I logged that experience and let my masters know. Come back soon!"
    } 
    bag = multiplyBag(days, bag);
    let response = "";
    response += `${bag.socks} socks,`;
    response += `${bag.underwear} pairs of underwear,`;
    response += bag.hikingBoots ? `take some hiking boots`: '';
    response += bag.swimmingUnderwear ? `also swimming underwear`: '';
    response += bag.towel > 1 ? `${bag.towel} towels` : 'towel';
    response += `${bag.tshirts} T-shirts`;
    response += bag.pants > 1 ? `${bag.pants} pants` : 'pants';
    return response
}

export async function countMyResponse(days: any, experience: any): Promise<List|string> {
    let bag = await countMyBag(days, experience);
    if (bag === null){
        return "Missing data...I logged that experience and let my masters know. Come back soon!"
    }
    bag = multiplyBag(days, bag);
    const items: any = {};
    items['socks'] = {
        title: `${bag.socks} socks`
    };
    items['underwear'] = {
        title:  `${bag.underwear} pairs of underwear`
    };
    if (bag.hikingBoots){
        items['hikingboots'] = {
            title:  `Hiking boots`
        };
    }
    if (bag.swimmingUnderwear){
        items['swimming'] = {
            title:  `Swimming underwear`
        };
    }
    if (bag.towel > 1){
        items['towel'] = {
            title:  `${bag.towel} towels`
        };
    } else {
        items['towel'] = {
            title:  `Towel`
        };
    }
    items['tshirst'] = {
        title: `${bag.tshirts} T-shirts`
    };
    if (bag.pants > 1){
        items['pants'] = {
            title:  `${bag.pants} pants`
        };
    } else {
        items['pants'] = {
            title: 'pants'
        };
    }
    const response = new List({
        title: 'Your bag',
        items: items
    })
    return response
}

async function countMyBag(days: any, experience: any): Promise<Bag|null> {
    const exp = await admin.firestore().collection("experiences").where("name", "==", experience).get();
    if (exp.empty){
        return null;
    } else {
        const data = exp.docs[0].data();
        return data.bag;
    }
}

function multiplyBag(days: any, bag: Bag):Bag {
    bag.pants = Math.ceil(bag.pants * days);
    bag.tshirts = Math.ceil(bag.tshirts * days);
    bag.towel = Math.ceil(bag.towel * days);
    bag.socks = Math.ceil(bag.socks * days);
    bag.underwear = Math.ceil(bag.underwear * days);
    return bag;
}