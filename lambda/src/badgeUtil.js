const moment = require("moment-timezone");

const HELICOPTER_THRESHOLD = 5;

// TODO: use cactus.daysAlive instead of actualDuration because we already have computed it :)
const evaluate = function(profile, currentTime) {

    const unlockedBadges = profile.unlockedBadges;
    profile.newBadge = false;// Currently one turn behind since this is run in the request interceptor.

    const waterUnits = profile.lifeTime.waterUnits;
    const waterThreshold = Math.pow(2, unlockedBadges.waterUnits.length) * 100;    

    if(waterUnits > 99 && waterUnits >= waterThreshold) {
        // update the badges
        unlockedBadges.waterUnits.push(waterUnits);
        profile.unlockedBadges.latest = `サボテンに与えた通算水量が ${waterThreshold} ユニットを超えた。`;
    }

    // early bird badge rules check
    if(currentTime.hour() >= 4 && currentTime.hour() <= 7) {
        if(!unlockedBadges.earlyBird) {
            profile.unlockedBadges.latestKey = "earlyBird";
            profile.newBadge = true;
        }
        unlockedBadges.earlyBird = true;
        unlockedBadges.latest = '朝4時から7時のあいだにサボテンをチェックした「アーリーバード」バッジ';
    }

    // night owl badge rules check
    if(currentTime.hour() == 0 && (currentTime.hour() <= 3 && currentTime.minutes()) <= 59 ) {
        if(!unlockedBadges.nightOwl) {
            profile.unlockedBadges.latestKey = "nightOwl";
            profile.newBadge = true;
        }
        unlockedBadges.nightOwl = true;
        unlockedBadges.latest = '深夜0時から3時までのあいだにサボテンをチェックした「ナイトオウル」バッジ';
    }

    //TODO investigate why changing back to dateOfBirthday still passes tests
    const actualDuration = moment.duration(currentTime.diff(profile.cactus.dayOfBirth));

    const badgeDurations = [
        1,  // 1 day
        3,  // 3 days
        7,  // 1 Week
        14, // 2 weeks
        30, // 1 Month
        90, // 3 months
        180, //6 months
        365, //12 months
    ];

    badgeDurations.forEach((badgeDuration, _) => {
        if(unlockedBadges.durations[badgeDuration]) {
            return;
        }
        if(actualDuration.asDays() >= badgeDuration) {
            unlockedBadges.durations[badgeDuration] = true;
            unlockedBadges.latest = `${badgeDuration}日間サボテンを生存させた。`;
        } else {
            unlockedBadges.durations[badgeDuration] = false;
        }
    });

    //helicopter parent
    if (!unlockedBadges.helicopterParent && profile.timesChecked >= HELICOPTER_THRESHOLD) {
        if(!unlockedBadges.helicopterParent) {
            profile.unlockedBadges.latestKey = "helicopterParent";
            profile.newBadge = true;
        }
        unlockedBadges.helicopterParent = true;
        unlockedBadges.latest = `サボテンの周りをずっと旋回しているヘリコプターペアレントのように、1日に ${HELICOPTER_THRESHOLD} 回チェックした。`
    }

    return unlockedBadges
}


const reset = function(badges) {

    badges.earlyBird = false;
    badges.nightOwl = false;
    badges.helicopterParent = false;
    badges.latest = '';

    for(let key in badges.durations) {
        badges.durations[key] = false;
    }

    // callout for OxygenBox :)
    badges.lostAllBadges = true;

    return badges;

};

module.exports = {
    evaluate,
    reset
};