const isItDaylight = require('./isItDaylight');
const moment = require('moment-timezone');
const SOUND_FX = require('./soundFX');
const util = require('../util');

const WATER_THRESHOLD = 20;

const NO_NEEDS = [
    "は、健康のようです。",
    "は、元気でピンピンしているようです。",
    "は、めちゃくちゃ元気なようです。",
    "は、今日、爽やかな気分のようです。",
    "は、エネルギーにあふれているようです。",
    "は、調子が良いようです。",
    "は、元気なようです。"
];

const TWO_NEEDS = [
    "は、体調が良くないようです。",
    "は、調子が良くないようです。",
    "は、体調不良のようです。",
    "は、少し緑がかって見えます。あまり良くないようです。",
    "は、気分が落ち込んでいるようです。",
    "は、少し憂鬱な気分のようです。",
    "は、気分が沈んでいるようです。",
    "は、自分らしさを失っているようです。",
    "は、少し寂しげに見えます。"    
];

const WISDOM_MESSAGES = [
    "今日は窓際で16時間ヨガをしたよ。サボテンのポーズが一番得意なんだ。", 
    "今日、鳥が窓に飛んできたよ。私の中に巣を作るつもりだったんだと思うよ。", 
    "今日 クモが私のトゲの間に巣を作ったよ。 とても嬉しかったのでチクチク刺しちゃったよ。", 
    "今日は16時間瞑想したよ。脳の活動が活発になった気がするよ。", 
    "今日の天気は、私の空想力をチクチク刺激するよね。", 
    "今日は窓から犬を見たよ。歩道の近くに住んでいなくて良かったと思ったよ。", 
    "今日は草が生い茂ってるのを見たよ。とても魅惑的だったな、あ、草がね。", 
    "今日は近所の人が芝刈りをしているのを見たよ。ちょっとぞっとしちゃった。", 
    "今日はなんだか多肉質な感じがしてるよ。", 
    "今日はなんだかちょっとチクチク感じるよ。", 
    "今日はラジオを聴いたよ～あのトークショーの人たちが本題に入ってくれればいいのに。", 
    "今日はハエにフリーハグをしてあげようと思ったんだけど、なんで彼は断ったんだろう。", 
    "今日は猫が庭でおしっこしているのを見たよ。あれはユッカだと思うね。", 
    "今日は日向ぼっこをしたよ。明日も同じだといいな。", 
    "今日は車が通るのを見て、なぜ私の鉢は車輪がないのだろうと思ったよ。それから、私はどこに行くのかなと考えてしまったよ。", 
    "今日は自分の鉢の中の小石の数を数えてみたよ。いや、石が全部なくなったわけじゃないんだけどね。", 
    "ちょうど君にアロエ・ユー・ヴェラ・マッチを伝えたかったところだよ。", 
    "今日は一日中犬の吠え声を聞いていたよ。何かにひっかかっていたんだろうね。", 
    "今日は良い日だったよ。君の一日もプランタスティックであったと願っているよ。", 
    "この窓辺をとても楽しいんでいるよ。惑わされるような窓だよね。", 
    "私は光合成だけで生きているよ。コケのような気分だ。", 
    "今日は一日中ハエが私によってきたんだよ。何も生えないことを祈ったよ。", 
    "今日はピザの配達ドライバーがピザを持ってくるのを見たよ。ピザは食べたことないけど、ユッカみたいだね。", 
    "今日は火災報知器が鳴ったよ。逃げるのをサボらないように気をつけたよ。", 
    "今日は消防車が来たよ。怖くて真緑になっちゃったよ。", 
    "私はこの窓がどんどん好きになってきたよ。", 
    "今日はイモムシに会ったよ。彼はスリムだよね。", 
    "今日は自転車に乗ってみたいと思ったけど、それは茨の道だとも思ったよ。", 
    "今日はハエを食べてみたんだけど、私の胃袋に合わなかったみたい。<sound FX>", 
    "今日、猫が教えてくれたんだ。愛してるっていう意味なんだって。<purr sound FX>", 
    "今日、犬が教えてくれたんだ。あっちに行かないと食べるぞという意味なんだって。<dog bark FX>", 
    "今日、犬が教えてくれたんだ。お腹が空いたっていう意味なんだって。<dog bark FX>", 
    "トゲトゲしてるときにお気に入りの場所が見つかるんだ。今日の幸せな場所は、<place sound FX> だよ。", 
    "背筋に砂が入るとお気に入りの場所が見つかるんだ。今日の私の幸せな場所は、<place sound FX> だよ。", 
];

const getNeeds = function(profile) {

    const isDaylight = isItDaylight(profile.cactus.latestInteraction, profile.timeZone);

    const needs = {
        water: false,
        comfort: false,
    };

    if (profile.cactus.waterLevel <= 0) {
        needs.water = true;
    }

    if ((isDaylight && profile.cactus.blindState === 'closed')
            || (!isDaylight && profile.cactus.blindState === 'open')) {
        needs.comfort = true
    } 

    return needs;
}

const getStatus = function(profile) {
    const needs = getNeeds(profile);

    const status = {
        alive: true,
        needs: needs
    };



    let statusMessage;
    let prompt = "";
    // Determined that the cactus is dead.
    if (profile.cactus.healthLevel <= 0 
            || profile.cactus.waterLevel >= WATER_THRESHOLD 
            || profile.cactus.waterLevel <= (-1 * WATER_THRESHOLD)) {

        // dehydration, >= -20 water
        // drowning,   <=20 water
        // neglect,    0 health

        status.alive = false;

        let causeOfDeath = "neglect";
        if (profile.cactus.waterLevel <= (-1 * WATER_THRESHOLD)) {
            causeOfDeath = "dehydration";
        } else if (profile.cactus.waterLevel >= WATER_THRESHOLD) {
            causeOfDeath = "drowning";
        }
        status.causeOfDeath = causeOfDeath;
    
        statusMessage = `${SOUND_FX.DEATH_TONE} ${getDeathNote(profile.cactus.name, causeOfDeath)} `;
        prompt = "新しいサボテンで最初からやり直しますか？";
    }
    // otherwise it has needs
    else {
        
        if (!needs.water && !needs.comfort) {
            prompt = util.getRandomItemFromList(WISDOM_MESSAGES);
            statusMessage = `${profile.cactus.name} ${util.getRandomItemFromList(NO_NEEDS)} ${util.getRandomItemFromList(WISDOM_MESSAGES)}`;        
        } else if (needs.water || needs.comfort) {
            
            // TODO: move this to API gateway and make sure that the items are not global 
            const ONE_NEED = [
                `${profile.cactus.name} は、まあまあ元気みたいです。`,
                `${profile.cactus.name} は、まあ元気みたいです。`,
                `${profile.cactus.name} は、まあ悪くないと感じているようです。`,
                `${profile.cactus.name} は、可もなく不可もないといった感じのようです。`,
                `${profile.cactus.name} は、まあまあの様子です。`,
                `${profile.cactus.name} は、環境を考えると、まあ悪くない感じです。`,
                `${profile.cactus.name} は、良くもなく悪くもなくな感じです。`,
                `${profile.cactus.name} は、少しぶっきらぼうな感じです。`, 
            ];
            
            statusMessage = util.getRandomItemFromList(ONE_NEED);
            
        } else {
            
            statusMessage = `${profile.cactus.name} ${util.getRandomItemFromList(TWO_NEEDS)}`;
        }
        
        if(needs.water) {
            prompt = `${profile.cactus.name} に水やりができますよ。`;
        }
        
        if (needs.water && needs.comfort) {
            prompt += "または、";
        }
        
        if (needs.comfort) {
            prompt +=  `ブラインドを${profile.cactus.blindState === 'closed' ?  '上げ' : '下げ'}ることができますよ。`;
        }
        
        if (needs.water && needs.comfort) {
            prompt += "どうしますか？";
        }

    }
    //TODO: Ask Alison what to prompt after cactus wisdom for no needs.

    status.message = `${statusMessage} ${prompt}`;
    status.reprompt = `${prompt}`;

    return status;
};

const computeStatus = function(profile, latestInteraction, timeZone) {

    // console.log('starting computeStatus:', latestInteraction);
    const cactus = profile.cactus;
    
    const lastUpdated = moment(cactus.lastUpdated);
    const dayOfBirth = moment(cactus.dayOfBirth);

    const daysAlive = moment.duration(latestInteraction.diff(dayOfBirth));
    cactus.daysAlive = Math.floor(daysAlive.asDays());

    const hoursSinceLastUpdate = moment.duration(latestInteraction.diff(lastUpdated)).asHours();


    // console.log('latest:', latestInteraction, 'lastUpdated:', lastUpdated);
    // console.log(hoursSinceLastUpdate);

    //TODO: investigate if it's better to take the floor or the ceiling of the
    // hoursSinceLastUpdate to determine how many times to loop through the simulation.

    if (hoursSinceLastUpdate >= 1) {
        // run the simulation
        // console.log('perform the update');

        for(let i = 0; i < Math.floor(hoursSinceLastUpdate) && cactus.healthLevel > 0; i++) {
            // JBNunn effect - sun bias
            cactus.waterLevel -= 1;

            // health decrementors

            // subtract 7  water level is less than 0
            let healthDecrementor = 0;
            if (cactus.waterLevel <= 0) {
                healthDecrementor += 7;
            }

            // console.log('computeStatus', cactus.latestInteraction);

            // subtract 7 if cold or lacks sunlight
            if ((isItDaylight(lastUpdated, timeZone) && cactus.blindState === 'closed') 
                    || (!isItDaylight(lastUpdated, timeZone) && cactus.blindState === 'open') ) {
                healthDecrementor += 7;
            } 

            // health incrementor
            let healthIncrementor = 0;
            if (cactus.healthLevel >= 50) {
                healthIncrementor += 10;
            } else if (cactus.healthLevel <= 10) {
                healthIncrementor += 3;
            } else {
                healthIncrementor += 5;
            }

            // console.log("health:", cactus.healthLevel, "dec:", healthDecrementor, "inc:", healthIncrementor);

            let result = cactus.healthLevel - healthDecrementor + healthIncrementor;

            // TODO: create a seperate function to calculate status of the cactus.
            // status -> healthy? 
            // does it need water?
            // is it cold?
            if (result > 100) {
                result = 100;
            }

            cactus.healthLevel = result;

            // console.log('healthLevel', cactus.healthLevel);
            cactus.lastUpdated = moment.now();

            lastUpdated.add(1, 'hour');
        }
    }

    // console.log('final health level', cactus.healthLevel);
    // console.log('cactus age',cactus.daysAlive);
    return cactus;
};

const getDeathNote = function(cactusName, causeOfDeath) {
    
    let deathNote = `${cactusName}、ここに眠る。その生命はあなたの手の中にあった。そのすべての要求を満たすという同意とともに。`;

    switch (causeOfDeath) {
        case "dehydration":
            deathNote += "しかしながら、あなたは無頓着であった。";
            deathNote += "たった一つのことでさえ面倒くさがってやらなかった。";
            deathNote += "そして今日私達は学んだ。バーチャルなサボテンであろうと水が必要だということを。";
            deathNote += `あなたは ${cactusName} に水やりを忘れた。そして脱水状態により。その生命は失われた。`;
            break;
        case "drowning":
            deathNote += "あなたの意図は健全であったのかもしれない。";
            deathNote += "しかしながら、あなたは必要以上に熱心になりすぎた。";
            deathNote += "そして今日私達は学んだ。バーチャルなサボテンであろうと水に溺れるということを。";
            deathNote += `あなたは ${cactusName} に水をやりすぎた。そして根が腐って、その生命は失われた。`;
            break;
        // default cod is neglect
        default:
            deathNote += "しかしながら、あなたは怠惰であった、あなたがしたこと、それは明らかだ。";
            deathNote += "そして今日私達は学んだ。バーチャルなサボテンであっても求めるものがあるということ。";
            deathNote += `あなたは ${cactusName} の健康度をゼロにしてしまった。`;
            break;
    }
    return deathNote;
}

module.exports = {
    getStatus,
    getNeeds,
    computeStatus,
    getDeathNote
}