/**
 * ==============================================================================
 * 歷史情境模擬 RPG - 資料模型與核心狀態結構 (Data Models & JSON Schema)
 * ==============================================================================
 */

const GAME_IDENTITIES = [
  {
    id: 'merchant_tea',
    title: '大稻埕見習茶商',
    name: '林承恩',
    desc: '祖輩在深坑種茶，隨開港潮流來到大稻埕洋行街，試圖將臺灣茶推向萬國舞台。',
    initialSilver: 150,
    initialReputation: 10,
    initialKnowledge: 25,
    avatar: '🍵'
  },
  {
    id: 'bureaucrat_customs',
    title: '淡水海關副通判',
    name: '沈士彥',
    desc: '督理淡水開港稅務，兼管番社互市。在守舊清議與西方洋務衝擊間如履薄冰。',
    initialSilver: 300,
    initialReputation: 40,
    initialKnowledge: 50,
    avatar: '📜'
  },
  {
    id: 'dock_worker',
    title: '艋舺渡船碼頭工',
    name: '陳阿狗',
    desc: '憑一把子力氣在淡水河碼頭搬貨，熟知市井暗號與潮汐水路，志在自立行郊。',
    initialSilver: 50,
    initialReputation: 5,
    initialKnowledge: 15,
    avatar: '⚓'
  }
];

// 視覺階層晉升設定 (Progression & Appearance Tiers)
const PROGRESSION_TIERS = [
  {
    level: 1,
    name: '布衣挑擔行腳商',
    title: '初出茅廬',
    outfitDesc: '粗布麻衣手推車，奔波於淡水河畔與街頭巷尾',
    sceneDesc: '大稻埕街頭路邊攤',
    minSilver: 0,
    badgeColor: 'from-slate-600 to-slate-800',
    avatarArt: '🍵',
    mapSprite: '🚶'
  },
  {
    level: 2,
    name: '長衫算盤大掌櫃',
    title: '初露崢嶸',
    outfitDesc: '身著藏藍直綴，腰繫象牙算盤，掌管一進臨街鋪面',
    sceneDesc: '大稻埕貴德街臨街茶號',
    minSilver: 350,
    badgeColor: 'from-amber-600 to-amber-800',
    avatarArt: '👘',
    mapSprite: '🧑‍💼'
  },
  {
    level: 3,
    name: '綾羅綢緞商號巨賈',
    title: '北臺茶界巨擎',
    outfitDesc: '頭戴瓜皮帽身披蘇繡馬褂，坐擁三進深宅大院與私人商船號',
    sceneDesc: '三進式合記大商行洋樓',
    minSilver: 800,
    badgeColor: 'from-purple-600 to-indigo-900',
    avatarArt: '👑',
    mapSprite: '🤴'
  }
];

// 玩家自家宅邸建造升級體系 (Player Home & Estate Progression)
const HOME_TIERS = [
  {
    level: 1,
    name: '臨河竹籬小茅舍',
    title: '草廬初立 · 遮風避雨',
    desc: '初到大稻埕時賃居的小茅草屋，雖簡樸無華，卻是日後商界傳奇的起點。',
    cost: 0,
    rentPerInterval: 0, // 每週期租金收益 (兩)
    unlockedOutfitId: 'outfit_peasant',
    buffText: '解鎖初始【布衣挑擔短打】，可在自家休憩整理行裝。',
    sceneStyle: 'thatched_cottage'
  },
  {
    level: 2,
    name: '貴德街紅磚燕尾瓦厝',
    title: '起造新居 · 初具基業',
    desc: '用做茶賺來的第一桶金購地起造的臨街紅磚厝，高懸門燈，鄰里側目。',
    cost: 160,
    rentPerInterval: 15, // 每 25 秒產出 15 兩
    unlockedOutfitId: 'outfit_scholar',
    buffText: '每週期產出 15 兩店面租金分紅！移動疾跑速度永久 +10%！解鎖【藏青長衫掌櫃裝】。',
    sceneStyle: 'red_brick_house'
  },
  {
    level: 3,
    name: '閩南雕花雙進大宅院',
    title: '名門望族 · 門庭若市',
    desc: '標準閩南合院格局，前進為商務帳房，後進為起居深宅，雕樑畫棟、極盡氣派。',
    cost: 420,
    rentPerInterval: 35, // 每 25 秒產出 35 兩
    unlockedOutfitId: 'outfit_comprador',
    buffText: '每週期產出 35 兩商行分紅！商界聲望 +30，商業暴擊率 +10%！解鎖【英商買辦西服】。',
    sceneStyle: 'courtyard_mansion'
  },
  {
    level: 4,
    name: '巴洛克西洋鐘樓商號豪邸',
    title: '開港第一富豪 · 傳奇巨賈',
    desc: '融合西洋巴洛克拱廊與東方石雕的頂級洋樓商邸，高聳鐘樓傲視大稻埕港灣，名震萬國商界！',
    cost: 850,
    rentPerInterval: 80, // 每 25 秒產出 80 兩
    unlockedOutfitId: 'outfit_magnate',
    buffText: '每週期產出 80 兩洋行巨額分紅！聲望 +60，全商路交易收益 +25%，解鎖富商金色步履光環！解鎖【蘇繡金絲朝珠袍】。',
    sceneStyle: 'baroque_palace'
  }
];

// 玩家衣裳閣造型更換庫 (Customizable Costumes & Outfits)
const HOME_OUTFITS = [
  {
    id: 'outfit_peasant',
    name: '布衣挑擔短打',
    tierLevelRequired: 1,
    avatar: '🍵',
    badge: '素雅樸實',
    desc: '粗布短褐，腰束布帶，隨身挑著深坑茶簍，滿是大稻埕創業初期的拼勁。',
    passive: '基礎跑商裝扮'
  },
  {
    id: 'outfit_scholar',
    name: '藏青長衫掌櫃裝',
    tierLevelRequired: 2,
    avatar: '👘',
    badge: '儒商氣質',
    desc: '藏青杭綢直綴，腰掛象牙微雕算盤與黃銅鑰匙，舉手投足已有商號掌櫃之威儀。',
    passive: '走路步伐更矯健，行商買賣更自信'
  },
  {
    id: 'outfit_comprador',
    name: '英商買辦西服禮帽',
    tierLevelRequired: 3,
    avatar: '🤵',
    badge: '洋務菁英',
    desc: '英式精紡深灰三件套西裝，內襯雪白，手持鍍銀手杖，出入各大洋行暢行無阻。',
    passive: '極受洋行信任，自帶異國紳士談判氣場'
  },
  {
    id: 'outfit_magnate',
    name: '蘇繡金絲商賈朝珠袍',
    tierLevelRequired: 4,
    avatar: '👑',
    badge: '尊榮至極',
    desc: '大紅暗花緞袍外罩金絲繡孔雀馬褂，胸懸翡翠朝珠，行走時地面泛起金色聚寶光暈！',
    passive: '頂級巨賈外觀，自帶全屏金色聚寶光環'
  }
];

// 虛擬大地圖探索建築地標 (World Map Interactive Locations - 簡潔扼要)
const MAP_LOCATIONS = [
  {
    id: 'loc_player_home',
    name: '大稻埕 · 承恩商邸',
    subTitle: '自家產業 · 建造換裝與收租',
    icon: '🏡',
    banner: '🏡 承恩宅邸',
    themeColor: '#22c55e',
    type: 'player_home',
    x: 415,
    y: 110,
    width: 155,
    height: 120,
    roofStyle: 'player_home_roof',
    doorX: 492,
    doorY: 175,
    prompt: '按空白鍵或點擊【進入自家商邸】'
  },
  {
    id: 'loc_dock',
    name: '大稻埕碼頭棧房',
    subTitle: '碼頭理貨 · 現賺銀兩與秘笈',
    icon: '⚓',
    banner: '🚢 碼頭貨場',
    themeColor: '#38bdf8',
    type: 'minigame',
    x: 415,
    y: 380,
    width: 155,
    height: 115,
    roofStyle: 'dock_roof',
    doorX: 490,
    doorY: 440,
    prompt: '按空白鍵或點擊【開始理貨打工】'
  },
  {
    id: 'loc_tea_firm',
    name: '英商寶順洋行',
    subTitle: '外銷主力 · 烏龍茶直銷紐約',
    icon: '🍵',
    banner: '🇬🇧 寶順洋行',
    themeColor: '#f59e0b',
    type: 'choice_tea',
    x: 690,
    y: 110,
    width: 165,
    height: 120,
    roofStyle: 'western_arcade',
    doorX: 770,
    doorY: 175,
    prompt: '按空白鍵或點擊【洽談茶葉生意】'
  },
  {
    id: 'loc_sugar_guild',
    name: '艋舺老糖郊商號',
    subTitle: '傳統老店 · 赤砂糖內銷',
    icon: '🍯',
    banner: '🏮 泉郊金聯成',
    themeColor: '#f97316',
    type: 'choice_sugar',
    x: 135,
    y: 110,
    width: 155,
    height: 120,
    roofStyle: 'fujian_courtyard',
    doorX: 210,
    doorY: 175,
    prompt: '按空白鍵或點擊【進入老糖郊】'
  },
  {
    id: 'loc_smuggler',
    name: '𧶄瑯暗巷私渡口',
    subTitle: '高危黑市 · 小心被抓沒收',
    icon: '☠️',
    banner: '☠️ 𧶄瑯私渡口',
    themeColor: '#ef4444',
    type: 'danger_smuggle',
    x: 130,
    y: 350,
    width: 150,
    height: 115,
    roofStyle: 'pirate_shack',
    doorX: 205,
    doorY: 410,
    prompt: '⚠️ 危險黑市！小心被抓'
  },
  {
    id: 'loc_customs',
    name: '淡水海關稅務司署',
    subTitle: '官方稅務 · 爭議通關交涉',
    icon: '📜',
    banner: '⚖️ 淡水海關',
    themeColor: '#a855f7',
    type: 'choice_customs',
    x: 700,
    y: 350,
    width: 155,
    height: 115,
    roofStyle: 'customs_gate',
    doorX: 775,
    doorY: 410,
    prompt: '按空白鍵或點擊【進入海關交涉】'
  }
];

// 情報道具庫 (Clue Items Database - 簡短大白話)
const CLUE_DATABASE = {
  clue_dadaocheng_tea: {
    id: 'clue_dadaocheng_tea',
    name: '大稻埕行商秘笈',
    icon: '📜',
    rarity: 'SSR 必備情報',
    gameplayTip: '👉 快去東北方【寶順洋行】買深坑烏龍茶，利潤極高還能觸發「200% 暴擊」大噴錢！',
    historicalLore: '📜 英國商人陶德把臺灣茶賣到紐約爆紅，大稻埕因此變成臺灣最熱鬧發財的商港！',
    unlockedAt: null
  },
  clue_customs_tax: {
    id: 'clue_customs_tax',
    name: '淡水新關章程抄本',
    icon: '📑',
    rarity: 'SR 官府秘函',
    gameplayTip: '👉 官府抓走私很嚴！千萬別去西南方【私渡黑水寨】，走正規海關才能賺大錢！',
    historicalLore: '📜 淡水海關配備巡邏砲船查緝走私，只要守法經商，你的商號權益就有大保障！',
    unlockedAt: null
  }
};

// 時代奇物與圖鑑 (Collectibles & Relics - 簡短好懂)
const COLLECTIBLE_DATABASE = {
  relic_dodd_watch: {
    id: 'relic_dodd_watch',
    name: '陶德的純銀懷錶',
    rarity: '傳奇文物 ★★★★★',
    icon: '⏱️',
    buff: '全交易收益額外 +15%',
    lore: '英國洋行老闆陶德送的銀懷錶，象徵「時間就是金錢」！'
  },
  relic_formosa_tea_box: {
    id: 'relic_formosa_tea_box',
    name: '首批外銷烏龍茶箱',
    rarity: '珍品文物 ★★★★',
    icon: '📦',
    buff: '暴擊機率永久 +10%',
    lore: '印著金龍標籤的外銷茶箱，是臺灣烏龍茶名揚世界的起點！'
  }
};

// 核心劇情歷史節點 (Mainline Event Nodes - 精簡通俗，去除長篇大論)
const EVENT_NODES = {
  node_open_market: {
    id: 'node_open_market',
    era: '1869 年春 · 大稻埕開市熱潮',
    title: '大稻埕開市！走至目標商行，展開你的第一筆生意！',
    description: '淡水河汽笛響起，外國洋商雲集！請操控角色走進商行，做出你的商業抉擇！',
    historicalContext: '1860年代臺灣開港，茶葉是最大賺錢紅利！選對商路迎來暴富，走錯則會賠錢！',
    options: [
      {
        id: 'opt_tea_oolong',
        targetLocationId: 'loc_tea_firm',
        text: '【寶順洋行】收購深坑烏龍茶，直銷紐約大賺一筆！',
        badge: '👑 時代核心',
        requiredClues: ['clue_dadaocheng_tea'],
        isHistorical: true,
        baseCost: 100,
        baseSilverReward: 320,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 30,
          knowledgeDelta: 20,
          gainCollectibleId: 'relic_formosa_tea_box'
        },
        consequence: {
          narrative: '英國洋行老闆陶德喝了你的茶大讚好喝！當場用雙倍金幣包下所有茶葉，並簽下紐約大訂單！',
          historicalOutcome: '【史實趣聞】1869年臺灣烏龍茶直銷紐約大轟動，大稻埕從此一飛沖天！',
          ifOutcome: ''
        },
        nextNodeId: 'node_customs_dispute'
      },
      {
        id: 'opt_traditional_sugar',
        targetLocationId: 'loc_sugar_guild',
        text: '【艋舺老糖郊】收購傳統赤砂糖，穩定小賺。',
        badge: '🏮 守成平穩',
        requiredClues: [],
        isHistorical: false,
        baseCost: 90,
        baseSilverReward: 135,
        criticalChance: 0.15,
        criticalMultiplier: 1.2,
        effects: {
          reputationDelta: 5,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '老糖郊掌櫃付清銀兩。雖然有小賺，但看著洋行茶商滿載大賺，感覺錯過了大好時機！',
          historicalOutcome: '',
          ifOutcome: '【歷史啟發】傳統糖業雖穩，但跟上開港茶葉外銷新時代，才能賺到大財富！'
        },
        nextNodeId: 'node_customs_dispute'
      },
      {
        id: 'opt_contraband_fatal',
        targetLocationId: 'loc_smuggler',
        text: '【私渡黑水寨】走私粗麻黑市（極度危險！）',
        badge: '☠️ 致命警報',
        requiredClues: [],
        isHistorical: false,
        baseCost: 80,
        baseSilverReward: 0,
        criticalChance: 0.0,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -50,
          knowledgeDelta: 5
        },
        consequence: {
          narrative: '你剛走進黑市，巡邏砲船立刻開火抓人！私梟丟下你逃跑，銀兩全掉進河裡了……',
          historicalOutcome: '',
          ifOutcome: '【歷史小常識】開港後海關巡邏砲船抓走私極嚴，走歪路一定會血本無歸！'
        },
        isFatalDeath: true,
        nextNodeId: 'node_open_market'
      }
    ]
  },
  node_customs_dispute: {
    id: 'node_customs_dispute',
    era: '1869 年秋 · 淡水海關稅務司署',
    title: '海關抽稅爭吵不休，茶船快發霉了，該如何通關？',
    description: '茶船停在港口，洋商跟官府為了抽稅吵個沒完，再不出海茶葉要全毀了！',
    historicalContext: '洋人與清朝官員溝通困難，需要厲害的買辦居中調解，才能把生意做成！',
    options: [
      {
        id: 'opt_broker_deal',
        targetLocationId: 'loc_customs',
        text: '【淡水海關】聯手買辦李春生，化解通關糾紛，大賺外銷銀兩！',
        badge: '⚖️ 制度革新',
        requiredClues: ['clue_customs_tax'],
        isHistorical: true,
        baseCost: 50,
        baseSilverReward: 380,
        criticalChance: 0.50,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 40,
          knowledgeDelta: 30,
          gainCollectibleId: 'relic_dodd_watch'
        },
        consequence: {
          narrative: '你和李春生聯手力陳通商好處，成功說服海關！茶船順利出港，大賺一筆外匯！',
          historicalOutcome: '【歷史名人】李春生會說流利英文又懂經商，是帶領臺灣茶走向世界的大英雄！',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_bribe_official',
        targetLocationId: 'loc_smuggler',
        text: '【私渡黑水寨】偷偷漏夜強行運貨（高風險）',
        badge: '⚠️ 風險偏門',
        requiredClues: [],
        isHistorical: false,
        baseCost: 100,
        baseSilverReward: 110,
        criticalChance: 0.05,
        criticalMultiplier: 1.1,
        effects: {
          reputationDelta: -30,
          knowledgeDelta: 5
        },
        consequence: {
          narrative: '半夜偷偷運茶，茶船不幸擱淺泡水發霉！不但賠光本錢，名聲也跌入谷底……',
          historicalOutcome: '',
          ifOutcome: '【歷史啟發】海關稽查嚴密，走旁門左道成本高又危險，誠信通關才能做大生意！'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  }
};

window.GAME_MODELS = {
  GAME_IDENTITIES,
  PROGRESSION_TIERS,
  HOME_TIERS,
  HOME_OUTFITS,
  MAP_LOCATIONS,
  CLUE_DATABASE,
  COLLECTIBLE_DATABASE,
  EVENT_NODES
};
