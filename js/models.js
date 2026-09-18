/**
 * ==============================================================================
 * 歷史情境模擬 RPG - 資料模型與臺灣歷史年代長河結構 (Historical Eras & Data Models)
 * ==============================================================================
 */

// ======================== 1. 臺灣歷史脈絡完整七大年代章節 (國中臺灣史全篇章) ========================
const HISTORICAL_ERAS = [
  {
    id: 'era_01_prehistory',
    year: '舊石器時代',
    title: '史前時代・南島原民',
    period: '史前巨石與鐵器',
    badge: '第 1 章',
    themeColor: '#10b981',
    icon: '🏺',
    currencyName: '物資玉貝',
    currencyUnit: '玉貝',
    homeName: '板岩干欄石屋',
    homeActionDesc: '部落居所 · 工藝陳設 ▶',
    minimapTitle: '📍 卑南文化聚落全域',
    minimapYearBadge: '史前巨石',
    workActionName: '工藝打工',
    tags: ['舊石器', '新石器玉器', '十三行煉鐵', '南島語族'],
    summary: '從長濱打製石器、卑南磨玉到十三行高溫煉鐵，親歷島嶼萬年史前文明與原住民族社會組織。',
    defaultIdentityId: 'changbin_hunter',
    perspectives: [
      {
        id: 'changbin_hunter',
        subEraYear: '舊石器時代',
        roleType: 'civilian',
        roleTypeBadge: '🪨 舊石器獵人',
        title: '長濱八仙洞敲砸獵人',
        name: '長濱敲砸獵人',
        briefGoal: '在八仙洞海蝕洞穴敲擊礫石打製石器，採集漁獵並用火禦寒防獸',
        initialSilver: 80,
        initialReputation: 30,
        initialKnowledge: 35,
        avatar: '🪨',
        firstNodeId: 'node_changbin_stone_flaking',
        startingClueId: 'clue_changbin_flaked_stone'
      },
      {
        id: 'peinan_artisan',
        subEraYear: '新石器時代',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 部落長老',
        title: '卑南文化玉器宗師',
        name: '卑南玉工長老',
        briefGoal: '在玉玦工坊磨製臺灣玉玦與石板棺，建立島嶼玉器海外交換網',
        initialSilver: 100,
        initialReputation: 35,
        initialKnowledge: 40,
        avatar: '📿',
        firstNodeId: 'node_peinan_craft_trade',
        startingClueId: 'clue_peinan_jade'
      },
      {
        id: 'shisanhang_smith',
        subEraYear: '金屬器時代',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 鐵器巨擘',
        title: '十三行煉鐵匠首',
        name: '十三行鐵匠',
        briefGoal: '在煉鐵高溫工棚操控風箱冶煉鐵器，與外洋商船交換瑪瑙玻璃珠',
        initialSilver: 120,
        initialReputation: 25,
        initialKnowledge: 45,
        avatar: '🔥',
        firstNodeId: 'node_shisanhang_metallurgy',
        startingClueId: 'clue_shisanhang_bellows'
      },
      {
        id: 'amis_elder',
        subEraYear: '南島語族',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 部落領袖',
        title: '年齡階級大長老',
        name: '阿美族部落長老',
        briefGoal: '在聚會所維繫母系氏族，指揮青年年齡階級巡護部落傳承祭儀',
        initialSilver: 90,
        initialReputation: 50,
        initialKnowledge: 35,
        avatar: '🌾',
        firstNodeId: 'node_amis_matriarchy_order',
        startingClueId: 'clue_amis_age_rank'
      }
    ]
  },
  {
    id: 'era_02_international',
    year: '1624～1662',
    title: '荷治大員與西人競逐',
    period: '大航海與荷西競逐',
    badge: '第 2 章',
    themeColor: '#0284c7',
    icon: '⛵',
    currencyName: '荷蘭通商銀',
    currencyUnit: '里爾',
    homeName: '熱蘭遮商館居所',
    homeActionDesc: '要塞營造 · 鹿皮理貨 ▶',
    minimapTitle: '📍 大員熱蘭遮市街',
    minimapYearBadge: '1624 荷治',
    workActionName: '獵鹿理貨',
    tags: ['荷治大員', '鹿皮商貿', '新港文書', '郭懷一起事'],
    summary: '在荷蘭人高額苛稅與各國商船夾縫中求生，掌握轉口貿易與鹿皮外銷。',
    defaultIdentityId: 'coyett',
    perspectives: [
      {
        id: 'coyett',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ VOC長官',
        title: '荷蘭東印度公司末代長官',
        name: '揆一 (Coyett)',
        briefGoal: '審定海港關稅與查緝走私，堅守熱蘭遮城要塞財政',
        initialSilver: 300,
        initialReputation: 40,
        initialKnowledge: 55,
        avatar: '🏰',
        firstNodeId: 'node_coyett_siege_governance',
        startingClueId: 'clue_voc_tariff'
      },
      {
        id: 'he_bin',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 平民商人',
        title: '赤崁鹿皮通事／引鄭入臺',
        name: '何斌',
        briefGoal: '折衝鹿皮收購價，突破重稅並繪製水道圖引鄭軍入臺',
        initialSilver: 150,
        initialReputation: 30,
        initialKnowledge: 45,
        avatar: '🦌',
        firstNodeId: 'node_1642_deer_tax',
        startingClueId: 'clue_voc_deer'
      },
      {
        id: 'guo_huaiyi',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 起事墾首',
        title: '漢人移墾反苛稅領袖',
        name: '郭懷一',
        briefGoal: '聯合移墾漢人反抗人頭苛稅，率眾攻打普羅民遮城',
        initialSilver: 110,
        initialReputation: 45,
        initialKnowledge: 30,
        avatar: '⚔️',
        firstNodeId: 'node_guo_huaiyi_strike',
        startingClueId: 'clue_voc_poll_tax'
      },
      {
        id: 'candidius',
        roleType: 'pioneer',
        roleTypeBadge: '📜 傳教教化',
        title: '新港文字創製牧師',
        name: '甘治士 (Candidius)',
        briefGoal: '以羅馬字母拼寫西拉雅母語創製新港文字，教化原民編寫契約',
        initialSilver: 130,
        initialReputation: 50,
        initialKnowledge: 50,
        avatar: '📖',
        firstNodeId: 'node_candidius_script_mission',
        startingClueId: 'clue_candidius_sinkang_script'
      }
    ]
  },
  {
    id: 'era_03_zheng_regime',
    year: '1662～1683',
    title: '鄭氏治臺・反清復明',
    period: '明鄭王朝與海上商網',
    badge: '第 3 章',
    themeColor: '#e11d48',
    icon: '⚔️',
    currencyName: '東寧通寶官銀',
    currencyUnit: '兩',
    homeName: '東寧軍墾宅舍',
    homeActionDesc: '軍屯拓荒 · 宗族基業 ▶',
    minimapTitle: '📍 承天府東寧全域',
    minimapYearBadge: '1662 東寧',
    workActionName: '軍屯拓墾',
    tags: ['鹿耳門', '軍屯開墾', '全臺首學', '淋鹵曬鹽'],
    summary: '克服糧食危機，推行軍屯與海外走私商貿，建立抗清基地。',
    defaultIdentityId: 'chen_yonghua',
    perspectives: [
      {
        id: 'chen_yonghua',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 諮議參軍',
        title: '全臺首學奠基者',
        name: '陳永華',
        briefGoal: '建全臺首學孔廟、設科舉，推動寓兵於農軍屯與淋鹵曬鹽',
        initialSilver: 200,
        initialReputation: 55,
        initialKnowledge: 65,
        avatar: '📜',
        firstNodeId: 'node_chen_education_salt',
        startingClueId: 'clue_chen_confucian_temple'
      },
      {
        id: 'zheng_jing',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 延平王嗣',
        title: '經略海外東寧之主',
        name: '鄭經',
        briefGoal: '經略海外走私貿易、簽署英商協議，跨海支援抗清三藩',
        initialSilver: 350,
        initialReputation: 50,
        initialKnowledge: 50,
        avatar: '👑',
        firstNodeId: 'node_zheng_jing_foreign_trade',
        startingClueId: 'clue_zheng_eic_treaty'
      },
      {
        id: 'shi_lang',
        roleType: 'civilian',
        roleTypeBadge: '⚓ 水師提督',
        title: '清廷水師提督靖海侯',
        name: '施琅',
        briefGoal: '澎湖決戰克鄭軍，力排朝議上呈《臺灣棄留疏》保衛臺灣',
        initialSilver: 280,
        initialReputation: 45,
        initialKnowledge: 60,
        avatar: '🚢',
        firstNodeId: 'node_shi_lang_memorial_decision',
        startingClueId: 'clue_shi_memorial_draft'
      },
      {
        id: 'zhen_soldier',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 軍墾屯丁',
        title: '承天府拓荒軍墾屯丁',
        name: '東寧軍墾屯丁',
        briefGoal: '寓兵於農，在荒萊土地挖渠築堤開墾官田，解決大軍軍糧荒',
        initialSilver: 95,
        initialReputation: 35,
        initialKnowledge: 30,
        avatar: '🌾',
        firstNodeId: 'node_zhen_soldier_farming',
        startingClueId: 'clue_zhen_soldier_farming'
      }
    ]
  },
  {
    id: 'era_04_early_qing',
    year: '1683～1860',
    title: '清領前期・拓墾風雲',
    period: '唐山渡海與水利移民',
    badge: '第 4 章',
    themeColor: '#d97706',
    icon: '🌾',
    currencyName: '行商紋銀',
    currencyUnit: '兩',
    homeName: '鹿港土埆厝宅院',
    homeActionDesc: '行郊營運 · 家族置產 ▶',
    minimapTitle: '📍 一府二鹿三艋舺',
    minimapYearBadge: '1784 鹿港',
    workActionName: '行郊理貨',
    tags: ['渡臺禁令', '水圳開鑿', '分類械鬥', '一府二鹿三艋舺'],
    summary: '在禁令與械鬥夾縫中集資開鑿水圳，發展米糖農業並組建郊商。',
    defaultIdentityId: 'shi_shibang',
    perspectives: [
      {
        id: 'shi_shibang',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 拓墾先驅',
        title: '八堡圳籌建墾首',
        name: '施世榜',
        briefGoal: '集資修築八堡圳引濁水溪，灌溉彰化十三堡萬頃良田',
        initialSilver: 250,
        initialReputation: 40,
        initialKnowledge: 45,
        avatar: '🌊',
        firstNodeId: 'node_shi_babao_construction',
        startingClueId: 'clue_babao_canal_map'
      },
      {
        id: 'guo_xiliu',
        roleType: 'pioneer',
        roleTypeBadge: '🌊 北臺水利',
        title: '瑠公圳開鑿墾首',
        name: '郭錫瑠 (瑠公)',
        briefGoal: '引新店溪穿山劈石架設木梘，開鑿瑠公圳造福臺北盆地農民',
        initialSilver: 230,
        initialReputation: 45,
        initialKnowledge: 45,
        avatar: '💧',
        firstNodeId: 'node_guo_liugong_build',
        startingClueId: 'clue_guo_liugong_canal'
      },
      {
        id: 'zhu_yigui',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 鴨母王',
        title: '抗暴起事民變領袖',
        name: '朱一貴',
        briefGoal: '反抗地方知府苛政剝削，率眾揭竿起事攻入府城',
        initialSilver: 90,
        initialReputation: 50,
        initialKnowledge: 25,
        avatar: '🦆',
        firstNodeId: 'node_zhu_yigui_rebellion',
        startingClueId: 'clue_zhu_yigui_banner'
      },
      {
        id: 'lin_shuangwen',
        roleType: 'civilian',
        roleTypeBadge: '⚔️ 天地會首',
        title: '天地會抗清民變領袖',
        name: '林爽文',
        briefGoal: '反抗官府查緝壓迫發動大規模起義，席捲全臺震動朝野',
        initialSilver: 100,
        initialReputation: 55,
        initialKnowledge: 30,
        avatar: '🚩',
        firstNodeId: 'node_lin_shuangwen_uprising',
        startingClueId: 'clue_lin_shuangwen_seal'
      },
      {
        id: 'jiao_boss',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 郊商領袖',
        title: '艋舺三郊大掌櫃',
        name: '艋舺三郊大掌櫃',
        briefGoal: '掌控南北米糖對渡商網，化解分類械鬥維持港灣秩序',
        initialSilver: 320,
        initialReputation: 45,
        initialKnowledge: 40,
        avatar: '🏮',
        firstNodeId: 'node_jiao_merchant_market',
        startingClueId: 'clue_jiao_guild_seal'
      }
    ]
  },
  {
    id: 'era_05_late_qing',
    year: '1860～1895',
    title: '清領後期・近代化之路',
    period: '開港茶金與洋務新政',
    badge: '第 5 章',
    themeColor: '#854d0e',
    icon: '🍵',
    currencyName: '商號銀兩',
    currencyUnit: '兩',
    homeName: '大稻埕承恩宅邸',
    homeActionDesc: '建造 · 換裝 · 收租 ▶',
    minimapTitle: '📍 大稻埕港市全域',
    minimapYearBadge: '1869 開港',
    workActionName: '碼頭打工',
    tags: ['淡水開港', '烏龍茶金', '開山撫番', '鐵路新政'],
    summary: '經營茶糖樟腦外銷扭轉貿易逆差，並推進鐵路、電報洋務現代化。',
    defaultIdentityId: 'liu_mingchuan',
    perspectives: [
      {
        id: 'liu_mingchuan',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 首任巡撫',
        title: '臺灣省首任巡撫',
        name: '劉銘傳',
        briefGoal: '開鑿獅球嶺隧道，鋪設基隆至新竹鐵路與推動郵電清賦',
        initialSilver: 300,
        initialReputation: 60,
        initialKnowledge: 65,
        avatar: '🚂',
        firstNodeId: 'node_liu_railway_decision',
        startingClueId: 'clue_liu_railway_blueprint'
      },
      {
        id: 'shen_baozhen',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 欽差大臣',
        title: '牡丹社事件海防欽差',
        name: '沈葆楨',
        briefGoal: '築億載金城砲台，奏請廢除渡臺禁令並推行開山撫番',
        initialSilver: 280,
        initialReputation: 55,
        initialKnowledge: 60,
        avatar: '🏰',
        firstNodeId: 'node_shen_baozhen_reforms',
        startingClueId: 'clue_shen_coastal_fort'
      },
      {
        id: 'john_dodd',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 傳奇洋商',
        title: '寶順洋行經理',
        name: '陶德 (John Dodd)',
        briefGoal: '融資茶農引進安溪焙茶法，精焙 Formosa Tea 直銷紐約',
        initialSilver: 220,
        initialReputation: 45,
        initialKnowledge: 55,
        avatar: '🍵',
        firstNodeId: 'node_dodd_tea_export',
        startingClueId: 'clue_dodd_tea_contract'
      },
      {
        id: 'li_chunsheng',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 本土茶商',
        title: '大稻埕茶業之父',
        name: '李春生',
        briefGoal: '協助洋行收購烘焙優質茶葉，外銷全球造就大稻埕繁華商圈',
        initialSilver: 250,
        initialReputation: 50,
        initialKnowledge: 55,
        avatar: '💼',
        firstNodeId: 'node_li_chunsheng_tea_export',
        startingClueId: 'clue_li_chunsheng_tea_export'
      },
      {
        id: 'dr_mackay',
        roleType: 'pioneer',
        roleTypeBadge: '⛪ 宣教行醫',
        title: '淡水偕醫館創始人',
        name: '馬偕博士 (Dr. Mackay)',
        briefGoal: '拔牙行醫傳道，設立滬尾偕醫館，創辦牛津學堂與淡水女學堂',
        initialSilver: 140,
        initialReputation: 60,
        initialKnowledge: 65,
        avatar: '🩺',
        firstNodeId: 'node_mackay_clinic_college',
        startingClueId: 'clue_mackay_oxford_college'
      }
    ]
  },
  {
    id: 'era_06_japanese_rule',
    year: '1895～1945',
    title: '日治時期・抗爭與現代化',
    period: '殖民體制與非武裝啟蒙',
    badge: '第 6 章',
    themeColor: '#be185d',
    icon: '📢',
    currencyName: '臺灣銀行券',
    currencyUnit: '圓',
    homeName: '昭和和洋折衷洋邸',
    homeActionDesc: '近代地產 · 會社分紅 ▶',
    minimapTitle: '📍 榮町與大稻埕新街',
    minimapYearBadge: '1920 治警',
    workActionName: '會社打工',
    tags: ['三大調查', '嘉南大圳', '臺灣文化協會', '議會請願', '農民抗爭'],
    summary: '在嚴密警察保甲統治下，透過水利建設、文化啟蒙、議會請願與農民抗爭爭取權益。',
    defaultIdentityId: 'chiang_weishui',
    perspectives: [
      {
        id: 'chiang_weishui',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 文化先鋒',
        title: '臺灣文化之父・醫師',
        name: '蔣渭水',
        briefGoal: '發表《臨床講義》，創辦文化協會與《臺灣民報》醫治思想，組臺灣民眾黨',
        initialSilver: 150,
        initialReputation: 60,
        initialKnowledge: 70,
        avatar: '📢',
        firstNodeId: 'node_chiang_cultural_association',
        startingClueId: 'clue_clinical_notes'
      },
      {
        id: 'lin_xiantang',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 議會先驅',
        title: '臺灣議會請願領袖・林家紳商',
        name: '林獻堂',
        briefGoal: '領導向日本帝國議會發起15次議會設置請願，創辦臺灣文化協會，追求自治合法權利',
        initialSilver: 320,
        initialReputation: 65,
        initialKnowledge: 65,
        avatar: '🎩',
        firstNodeId: 'node_lin_petition_movement',
        startingClueId: 'clue_lin_petition_draft'
      },
      {
        id: 'goto_shimpei',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 民政長官',
        title: '臺灣總督府民政長官',
        name: '後藤新平',
        briefGoal: '以生物學原則主導土地/戶口/舊慣三大調查，推行專賣制度、度量衡與保甲體制',
        initialSilver: 350,
        initialReputation: 45,
        initialKnowledge: 75,
        avatar: '🎖️',
        firstNodeId: 'node_goto_state_surveys',
        startingClueId: 'clue_goto_three_surveys'
      },
      {
        id: 'jian_ji',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 蔗農抗暴',
        title: '臺灣農民組合運動代表',
        name: '簡吉',
        briefGoal: '組建臺灣農民組合，聲援二林蔗農事件，抗議製糖會社壓榨秤量與低價收購',
        initialSilver: 90,
        initialReputation: 60,
        initialKnowledge: 40,
        avatar: '🌾',
        firstNodeId: 'node_jian_ji_farmer_union',
        startingClueId: 'clue_jianji_farmer_union'
      },
      {
        id: 'hatta_yoichi',
        roleType: 'bureaucrat',
        roleTypeBadge: '🌊 水利總工',
        title: '烏山頭大圳總工程師',
        name: '八田與一',
        briefGoal: '興建烏山頭水庫與嘉南大圳，推行三年輪作給水法化看天田為米倉',
        initialSilver: 260,
        initialReputation: 50,
        initialKnowledge: 75,
        avatar: '💧',
        firstNodeId: 'node_hatta_irrigation_design',
        startingClueId: 'clue_wusanto_blueprint'
      },
      {
        id: 'mona_rudao',
        roleType: 'civilian',
        roleTypeBadge: '🏹 抗暴頭目',
        title: '賽德克馬赫坡社頭目',
        name: '莫那・魯道',
        briefGoal: '捍衛原民祖靈尊嚴與獵場，發動霧社事件抗擊殖民當局殘暴理蕃壓迫',
        initialSilver: 100,
        initialReputation: 65,
        initialKnowledge: 35,
        avatar: '🦅',
        firstNodeId: 'node_mona_wushe_uprising',
        startingClueId: 'clue_mona_ancestral_oath'
      }
    ]
  },
  {
    id: 'era_07_postwar_modern',
    year: '1945～近代',
    title: '戰後臺灣・奇蹟與民主',
    period: '戰後重建與民主轉型',
    badge: '第 7 章',
    themeColor: '#059669',
    icon: '🏭',
    currencyName: '經建研發資本',
    currencyUnit: '萬元',
    homeName: '現代智慧研發宅',
    homeActionDesc: '園區資產 · 專利技術 ▶',
    minimapTitle: '📍 戰後新興經建商圈',
    minimapYearBadge: '1970 經建',
    workActionName: '科技研發',
    tags: ['土地改革', '十大建設', '解除戒嚴', '民主直選'],
    summary: '穩定戰後物價，發展高科技工業代工，推動解除戒嚴與國會公民直選。',
    defaultIdentityId: 'chen_cheng',
    perspectives: [
      {
        id: 'chen_cheng',
        roleType: 'bureaucrat',
        roleTypeBadge: '🏛️ 改革推手',
        title: '土地改革主持者',
        name: '陳誠',
        briefGoal: '推行三七五減租、公地放領與耕者有其田，奠定農業轉型與工業基礎',
        initialSilver: 260,
        initialReputation: 50,
        initialKnowledge: 60,
        avatar: '📜',
        firstNodeId: 'node_chen_cheng_land_reform',
        startingClueId: 'clue_land_reform_order'
      },
      {
        id: 'sun_yunsuan',
        roleType: 'civilian',
        roleTypeBadge: '🧑‍🌾 科技擘劃',
        title: '十大建設與科技擘劃者',
        name: '孫運璿 / 李國鼎',
        briefGoal: '推動十大建設，創辦新竹科學園區引領晶圓半導體奇蹟',
        initialSilver: 300,
        initialReputation: 65,
        initialKnowledge: 70,
        avatar: '💻',
        firstNodeId: 'node_sun_hsinchu_park_setup',
        startingClueId: 'clue_hsinchu_park_charter'
      },
      {
        id: 'lee_tenghui',
        roleType: 'pioneer',
        roleTypeBadge: '⭐ 民主先生',
        title: '憲政民主轉型之鑰',
        name: '李登輝',
        briefGoal: '終止動員戡亂時期，推動國會全面改選與全民總統直選',
        initialSilver: 280,
        initialReputation: 70,
        initialKnowledge: 75,
        avatar: '🗳️',
        firstNodeId: 'node_lee_direct_democracy',
        startingClueId: 'clue_constitutional_reform'
      },
      {
        id: 'lei_zhen',
        roleType: 'pioneer',
        roleTypeBadge: '✒️ 自由之聲',
        title: '自由中國雜誌發行人',
        name: '雷震',
        briefGoal: '創辦《自由中國》針砭時政，反對威權統治，倡議籌組反對黨爭取憲政人權',
        initialSilver: 150,
        initialReputation: 65,
        initialKnowledge: 70,
        avatar: '📰',
        firstNodeId: 'node_lei_zhen_free_press',
        startingClueId: 'clue_lei_zhen_free_china'
      }
    ]
  }
];

// 舊版兼容身份列表 (映射到預設章節)
const GAME_IDENTITIES = HISTORICAL_ERAS[0].perspectives;

// ======================== 2. 視覺階層晉升設定 ========================
const PROGRESSION_TIERS = [
  {
    level: 1,
    name: '布衣挑擔行腳商',
    title: '初出茅廬',
    outfitDesc: '粗布麻衣手推車，奔波於港灣街道巷弄',
    sceneDesc: '街頭路邊初建小攤',
    minSilver: 0,
    badgeColor: 'from-slate-600 to-slate-800',
    avatarArt: '🍵',
    mapSprite: '🚶'
  },
  {
    level: 2,
    name: '長衫算盤大掌櫃',
    title: '初露崢嶸',
    outfitDesc: '身著藏藍長衫，腰繫精緻算盤，掌管臨街一進鋪面',
    sceneDesc: '繁華市街臨街商號',
    minSilver: 350,
    badgeColor: 'from-amber-600 to-amber-800',
    avatarArt: '👘',
    mapSprite: '🧑‍💼'
  },
  {
    level: 3,
    name: '綾羅綢緞商號巨賈',
    title: '時代商界巨擎',
    outfitDesc: '頭戴官帽身披錦繡華服，坐擁深宅大院與專屬商船',
    sceneDesc: '三進式合記大商行洋樓',
    minSilver: 800,
    badgeColor: 'from-purple-600 to-indigo-900',
    avatarArt: '👑',
    mapSprite: '🤴'
  }
];

// ======================== 2.1 玩家主要本體 · 跨時代歷史行商總位階 ========================
const MASTER_PROGRESSION_TIERS = [
  {
    level: 1,
    name: '初入時空 · 歷史見習者',
    minPoints: 0,
    badge: '銅牌行商',
    color: 'from-slate-600 to-slate-700',
    avatar: '🧭',
    desc: '初探臺灣歷史長河，開啟個人行囊與時代圖鑑。'
  },
  {
    level: 2,
    name: '洞悉商路 · 諸史經世者',
    minPoints: 60,
    badge: '銀牌行商',
    color: 'from-sky-600 to-cyan-700',
    avatar: '📜',
    desc: '穿梭不同時代洞悉商機，探索地標獲得見聞與情報提示。'
  },
  {
    level: 3,
    name: '聲名遠播 · 跨代名商',
    minPoints: 140,
    badge: '金牌行商',
    color: 'from-amber-600 to-yellow-700',
    avatar: '🏮',
    desc: '大名載入各代史冊商簿，全商貿交易利潤永久 +10%。'
  },
  {
    level: 4,
    name: '風雲掌舵 · 歷史觀測官',
    minPoints: 240,
    badge: '翡翠觀測官',
    color: 'from-emerald-600 to-teal-700',
    avatar: '👑',
    desc: '執掌歷史關鍵轉折節點，全年代暴擊機率永久 +10%。'
  },
  {
    level: 5,
    name: '千秋傳奇 · 時空商聖',
    minPoints: 380,
    badge: '傳奇商聖',
    color: 'from-purple-600 to-pink-700',
    avatar: '✨',
    desc: '歷代通關造就千秋功業，全時空行商與歷史評價大幅躍升！'
  }
];

// ======================== 3. 玩家自家宅邸升級 ========================
const HOME_TIERS = [
  {
    level: 1,
    name: '臨河竹籬小茅舍',
    title: '草廬初立 · 遮風避雨',
    desc: '初來乍到時賃居的小茅草屋，雖簡樸無華，卻是日後商界傳奇的起點。',
    cost: 0,
    rentPerInterval: 0,
    unlockedOutfitId: 'outfit_peasant',
    buffText: '解鎖初始【布衣挑擔短打】，可在自家休憩整理行裝。',
    sceneStyle: 'thatched_cottage'
  },
  {
    level: 2,
    name: '臨街紅磚燕尾瓦厝',
    title: '起造新居 · 初具基業',
    desc: '用賺來的第一桶金購地起造的臨街紅磚厝，高懸門燈，鄰里側目。',
    cost: 160,
    rentPerInterval: 15,
    unlockedOutfitId: 'outfit_scholar',
    buffText: '每週期產出 15 兩店面租金分紅！移動疾跑速度永久 +10%！解鎖【藏青長衫掌櫃裝】。',
    sceneStyle: 'red_brick_house'
  },
  {
    level: 3,
    name: '閩南雕花雙進大宅院',
    title: '名門望族 · 門庭若市',
    desc: '標準傳統合院格局，前進為商務帳房，後進為起居深宅，雕樑畫棟、極盡氣派。',
    cost: 420,
    rentPerInterval: 35,
    unlockedOutfitId: 'outfit_comprador',
    buffText: '每週期產出 35 兩商行分紅！商界聲望 +30，商業暴擊率 +10%！解鎖【洋務買辦西服】。',
    sceneStyle: 'courtyard_mansion'
  },
  {
    level: 4,
    name: '巴洛克西洋鐘樓商號豪邸',
    title: '時代第一巨賈 · 傳奇富豪',
    desc: '融合西洋巴洛克拱廊與東方石雕的頂級洋樓商邸，高聳鐘樓傲視港灣，名震商界！',
    cost: 850,
    rentPerInterval: 80,
    unlockedOutfitId: 'outfit_magnate',
    buffText: '每週期產出 80 兩巨額分紅！聲望 +60，全商路收益 +25%，解鎖金色步履光環！解鎖【蘇繡金絲朝珠袍】。',
    sceneStyle: 'baroque_palace'
  }
];

// ======================== 4. 玩家衣裳閣庫 ========================
const HOME_OUTFITS = [
  {
    id: 'outfit_peasant',
    name: '布衣挑擔短打',
    tierLevelRequired: 1,
    avatar: '🍵',
    badge: '素雅樸實',
    desc: '粗布短褐，腰束布帶，隨身挑著竹簍，滿是創業初期的拼勁。',
    passive: '基礎跑商裝扮'
  },
  {
    id: 'outfit_scholar',
    name: '藏青長衫掌櫃裝',
    tierLevelRequired: 2,
    avatar: '👘',
    badge: '儒商氣質',
    desc: '藏青長衫，腰掛象牙微雕算盤與黃銅鑰匙，舉手投足已有商號掌櫃之威儀。',
    passive: '走路步伐更矯健，買賣交涉更自信'
  },
  {
    id: 'outfit_comprador',
    name: '英商買辦西服禮帽',
    tierLevelRequired: 3,
    avatar: '🤵',
    badge: '洋務菁英',
    desc: '英式精紡深灰三件套西裝，內襯雪白，手持鍍銀手杖，出入各大洋行暢行無阻。',
    passive: '極受洋商信任，自帶異國紳士談判氣場'
  },
  {
    id: 'outfit_magnate',
    name: '蘇繡金絲商賈朝珠袍',
    tierLevelRequired: 4,
    avatar: '👑',
    badge: '尊榮至極',
    desc: '暗花大紅緞袍外罩金絲繡孔雀馬褂，行走時地面泛起金色聚寶光暈！',
    passive: '頂級巨賈外觀，自帶全屏金色聚寶光環'
  }
];

// ======================== 5. 各時代動態地圖建築 (開闊大氣佈局，徹底避免擁擠與誤觸) ========================
const ERA_MAP_LOCATIONS = {
  era_1642_voc: [
    {
      id: 'loc_player_home',
      name: '赤崁 · 漢人草廬寓所',
      subTitle: '自家產業 · 休憩換裝與分紅',
      icon: '🛖',
      banner: '🛖 漢商草廬',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入自家寓所】'
    },
    {
      id: 'loc_dock',
      name: '安平港荷蘭海運碼頭',
      subTitle: '港口理貨 · 清點鹿皮蔗糖獲取酬勞',
      icon: '⚓',
      banner: '🚢 安平碼頭',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點出口商貨】'
    },
    {
      id: 'loc_tea_firm',
      name: '東印度公司熱蘭遮商館',
      subTitle: '荷蘭官辦商館 · 採購鹿皮與轉口',
      icon: '⛵',
      banner: '🇳🇱 熱蘭遮商館',
      themeColor: '#0ea5e9',
      type: 'choice_voc_trade',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【進行洋商談判】'
    },
    {
      id: 'loc_sugar_guild',
      name: '赤崁原漢交易市集',
      subTitle: '平埔獵戶互市 · 鹿皮赤糖交易',
      icon: '🦌',
      banner: '🏹 赤崁市集',
      themeColor: '#f97316',
      type: 'choice_tribal_market',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【進入原漢互市】'
    },
    {
      id: 'loc_smuggler',
      name: '黑水溝私梟走私泊地',
      subTitle: '高危黑市 · 逃避荷蘭什稅',
      icon: '☠️',
      banner: '☠️ 避稅黑泊',
      themeColor: '#ef4444',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '⚠️ 危險黑市！小心巡邏快艇'
    },
    {
      id: 'loc_customs',
      name: '熱蘭遮城大員評議長官公署',
      subTitle: '政務司廳 · 關稅審定與公事交涉',
      icon: '🏰',
      banner: '⚖️ 評議公署',
      themeColor: '#a855f7',
      type: 'choice_voc_gov',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【晉見評議長官】'
    }
  ],
  era_1869_open_port: [
    {
      id: 'loc_player_home',
      name: '大稻埕 · 承恩商邸',
      subTitle: '自家產業 · 建造換裝與收租',
      icon: '🏡',
      banner: '🏡 承恩宅邸',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
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
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
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
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
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
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
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
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
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
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【進入海關交涉】'
    }
  ],
  era_1920_modern: [
    {
      id: 'loc_player_home',
      name: '太平町 · 現代寓所',
      subTitle: '自家產業 · 洋房居所與物業分紅',
      icon: '🏢',
      banner: '🏢 永樂寓所',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入自家寓所】'
    },
    {
      id: 'loc_dock',
      name: '臺北北門鐵道貨運驛',
      subTitle: '現代物流 · 調度鐵路貨物賺取工資',
      icon: '🚂',
      banner: '🚂 鐵道貨運驛',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點鐵路物資】'
    },
    {
      id: 'loc_tea_firm',
      name: '臺灣文化協會 · 港町講演會所',
      subTitle: '文化啟蒙 · 發布《臺灣民報》傳播新知',
      icon: '📢',
      banner: '🗞️ 文協講堂',
      themeColor: '#ec4899',
      type: 'choice_culture',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【參與文化集會】'
    },
    {
      id: 'loc_sugar_guild',
      name: '永樂町現代布批發株式會社',
      subTitle: '實業巨頭 · 南北貨與現代布疋流通',
      icon: '🧵',
      banner: '🏮 永樂批發會社',
      themeColor: '#f97316',
      type: 'choice_modern_trade',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【進入永樂商會】'
    },
    {
      id: 'loc_smuggler',
      name: '淡水河暗巷地下思想讀書會',
      subTitle: '地下啟蒙 · 傳閱進步新刊（小心特高巡警）',
      icon: '📕',
      banner: '📕 秘密新知讀書室',
      themeColor: '#ef4444',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '⚠️ 留意警視廳便衣臨檢！'
    },
    {
      id: 'loc_customs',
      name: '臺北州廳官署大樓',
      subTitle: '近代行政 · 請願書遞交與市政行政',
      icon: '🏛️',
      banner: '🏛️ 臺北州廳',
      themeColor: '#a855f7',
      type: 'choice_gov_modern',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【進入州廳行政辦事】'
    }
  ],
  era_01_prehistory: [
    {
      id: 'loc_player_home',
      name: '卑南聚落 · 板岩干欄石屋',
      subTitle: '自家居所 · 休息換裝與陶石貯藏',
      icon: '🛖',
      banner: '🛖 板岩石屋',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入部落寓所】'
    },
    {
      id: 'loc_dock',
      name: '卑南溪口竹筏渡頭',
      subTitle: '水岸集市 · 理貨與漁獵收穫清點',
      icon: '🛶',
      banner: '🛶 溪口渡頭',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點漁獵與石器商貨】'
    },
    {
      id: 'loc_tea_firm',
      name: '八仙洞海蝕洞穴',
      subTitle: '舊石器遺址 · 敲砸礫石打製與洞穴用火',
      icon: '🪨',
      banner: '🪨 八仙洞穴',
      themeColor: '#78716c',
      type: 'choice_tea',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【進入八仙洞穴】'
    },
    {
      id: 'loc_sugar_guild',
      name: '卑南玉玦琢磨工坊',
      subTitle: '玉器大宗 · 磨製臺灣玉與石板棺',
      icon: '📿',
      banner: '📿 玉玦作坊',
      themeColor: '#10b981',
      type: 'choice_sugar',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【進入玉石工坊】'
    },
    {
      id: 'loc_smuggler',
      name: '十三行高溫煉鐵工棚',
      subTitle: '冶鐵核心 · 風箱高溫冶煉鐵器與外洋商船',
      icon: '🔥',
      banner: '🔥 煉鐵工棚',
      themeColor: '#f59e0b',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '按空白鍵或點擊【進入煉鐵工棚】'
    },
    {
      id: 'loc_customs',
      name: '部落聚會所與巨石祭柱',
      subTitle: '長老議事 · 年齡階級與部落律法',
      icon: '🗿',
      banner: '🗿 部落聚會所',
      themeColor: '#a855f7',
      type: 'choice_customs',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【晉見部落長老】'
    }
  ],
  era_03_zheng_regime: [
    {
      id: 'loc_player_home',
      name: '承天府 · 東寧官紳宅邸',
      subTitle: '自家產業 · 休憩更衣與糧屯分紅',
      icon: '🏯',
      banner: '🏯 延平官邸',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入自家官邸】'
    },
    {
      id: 'loc_dock',
      name: '安平水師大營碼頭',
      subTitle: '軍港理貨 · 清點水師糧餉與商船物資',
      icon: '⚓',
      banner: '🚢 安平水師港',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點水師商貨糧餉】'
    },
    {
      id: 'loc_tea_firm',
      name: '英國東印度公司東寧商館',
      subTitle: '海上商網 · 簽訂軍火通商協議',
      icon: '🇬🇧',
      banner: '🇬🇧 英商通商館',
      themeColor: '#f59e0b',
      type: 'choice_tea',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【接洽洋行軍火商務】'
    },
    {
      id: 'loc_sugar_guild',
      name: '洲南場淋鹵日曬鹽場',
      subTitle: '文教實業 · 推廣淋鹵曬鹽法與蔗糖產銷',
      icon: '🧂',
      banner: '🧂 洲南鹽場',
      themeColor: '#06b6d4',
      type: 'choice_sugar',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【視察官辦鹽糖實業】'
    },
    {
      id: 'loc_smuggler',
      name: '黑水溝秘密抗清走私泊地',
      subTitle: '海外走私 · 突破清廷遷界禁令',
      icon: '☠️',
      banner: '☠️ 黑水溝商舟泊',
      themeColor: '#ef4444',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '⚠️ 巡防砲船出沒！謹慎走私交接'
    },
    {
      id: 'loc_customs',
      name: '全臺首學 · 臺南文廟參軍府',
      subTitle: '興學育才 · 陳永華科舉與軍屯籌劃',
      icon: '📜',
      banner: '📜 全臺首學',
      themeColor: '#a855f7',
      type: 'choice_customs',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【進入文廟參軍府】'
    }
  ],
  era_04_early_qing: [
    {
      id: 'loc_player_home',
      name: '鹿港大街 · 閩南紅磚三合院',
      subTitle: '自家居所 · 歇息換裝與祖產收租',
      icon: '🏡',
      banner: '🏡 鹿港紅磚祖厝',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入自家祖厝】'
    },
    {
      id: 'loc_dock',
      name: '一府二鹿三艋舺 · 對渡碼頭',
      subTitle: '兩岸港口 · 清點兩岸對渡米糖商貨',
      icon: '🚢',
      banner: '🚢 鹿港渡頭棧房',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點對渡米糖商貨】'
    },
    {
      id: 'loc_tea_firm',
      name: '彰化八堡圳分水大壩水工所',
      subTitle: '水利樞紐 · 施世榜導濁水溪灌溉良田',
      icon: '🌊',
      banner: '🌊 八堡圳水工所',
      themeColor: '#0284c7',
      type: 'choice_tea',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【調配水圳灌溉水閘】'
    },
    {
      id: 'loc_sugar_guild',
      name: '艋舺泉郊公館金聯成',
      subTitle: '郊商總會 · 控制南北兩岸對渡特產',
      icon: '🏮',
      banner: '🏮 艋舺三郊總館',
      themeColor: '#f97316',
      type: 'choice_sugar',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【商議郊商特產價格】'
    },
    {
      id: 'loc_smuggler',
      name: '𧶄瑯暗港偷渡黑泊',
      subTitle: '破禁偷渡 · 偷渡客無照暗渡（小心羅漢腳械鬥）',
      icon: '☠️',
      banner: '☠️ 偷渡暗渡頭',
      themeColor: '#ef4444',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '⚠️ 提防汛兵盤查與械鬥風聲！'
    },
    {
      id: 'loc_customs',
      name: '臺灣府衙門縣承分署',
      subTitle: '官府民政 · 渡臺照單審核與弭平民變',
      icon: '⚖️',
      banner: '⚖️ 臺灣府衙門',
      themeColor: '#a855f7',
      type: 'choice_customs',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【晉謁府縣通判】'
    }
  ],
  era_07_postwar_modern: [
    {
      id: 'loc_player_home',
      name: '現代住宅公寓公館',
      subTitle: '自家居所 · 現代家電與科技物業',
      icon: '🏢',
      banner: '🏢 科技公寓寓所',
      themeColor: '#22c55e',
      type: 'player_home',
      x: 620,
      y: 70,
      width: 160,
      height: 110,
      roofStyle: 'player_home_roof',
      doorX: 700,
      doorY: 130,
      prompt: '按空白鍵或點擊【進入現代公寓】'
    },
    {
      id: 'loc_dock',
      name: '高雄港加工出口區貨櫃碼頭',
      subTitle: '現代港灣 · 晶圓與成衣外銷貨櫃裝卸',
      icon: '🚢',
      banner: '🚢 高雄貨櫃港',
      themeColor: '#38bdf8',
      type: 'minigame',
      x: 620,
      y: 650,
      width: 160,
      height: 110,
      roofStyle: 'dock_roof',
      doorX: 700,
      doorY: 710,
      prompt: '按空白鍵或點擊【清點外銷電子貨櫃】'
    },
    {
      id: 'loc_tea_firm',
      name: '新竹科學園區半導體實驗室',
      subTitle: '高科技樞紐 · 晶圓代工與積體電路研發',
      icon: '💻',
      banner: '💻 竹科半導體所',
      themeColor: '#0ea5e9',
      type: 'choice_tea',
      x: 1060,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'western_arcade',
      doorX: 1140,
      doorY: 220,
      prompt: '按空白鍵或點擊【進入晶圓研發中心】'
    },
    {
      id: 'loc_sugar_guild',
      name: '臺灣電力公司十大建設籌劃處',
      subTitle: '現代工程 · 南北高速公路與重工業建設',
      icon: '⚡',
      banner: '⚡ 十大建設指揮部',
      themeColor: '#f59e0b',
      type: 'choice_sugar',
      x: 180,
      y: 160,
      width: 160,
      height: 110,
      roofStyle: 'fujian_courtyard',
      doorX: 260,
      doorY: 220,
      prompt: '按空白鍵或點擊【參與國家建設調度】'
    },
    {
      id: 'loc_smuggler',
      name: '地下民主刊物印刷所',
      subTitle: '民主思潮 · 秘密印刷黨外雜誌爭取解嚴',
      icon: '📑',
      banner: '📑 自由刊物印刷館',
      themeColor: '#ef4444',
      type: 'danger_smuggle',
      x: 180,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'pirate_shack',
      doorX: 260,
      doorY: 580,
      prompt: '⚠️ 留意警總查禁！推動憲政民主'
    },
    {
      id: 'loc_customs',
      name: '立法院暨總統府憲政大樓',
      subTitle: '民主轉型 · 國會全面改選與公民直選總統',
      icon: '🏛️',
      banner: '🏛️ 憲政民主大廳',
      themeColor: '#a855f7',
      type: 'choice_customs',
      x: 1060,
      y: 520,
      width: 160,
      height: 110,
      roofStyle: 'customs_gate',
      doorX: 1140,
      doorY: 580,
      prompt: '按空白鍵或點擊【進入憲政民主大廳】'
    }
  ]
};

// 7 大時代建築地圖映射與相容別名 (確保所有 eraId 均能無縫載入對應場景)
ERA_MAP_LOCATIONS.era_02_international = ERA_MAP_LOCATIONS.era_1642_voc;
ERA_MAP_LOCATIONS.era_05_late_qing = ERA_MAP_LOCATIONS.era_1869_open_port;
ERA_MAP_LOCATIONS.era_06_japanese_rule = ERA_MAP_LOCATIONS.era_1920_modern;

// 舊版別名相容
ERA_MAP_LOCATIONS.era_1642_voc = ERA_MAP_LOCATIONS.era_02_international;
ERA_MAP_LOCATIONS.era_1869_open_port = ERA_MAP_LOCATIONS.era_05_late_qing;
ERA_MAP_LOCATIONS.era_1920_modern = ERA_MAP_LOCATIONS.era_06_japanese_rule;

// 預設地圖
const MAP_LOCATIONS = ERA_MAP_LOCATIONS.era_01_prehistory;

// ======================== 5.5 時代市井 NPC 群像資料庫 (7 大時代專屬歷史人物群) ========================
const ERA_NPCS = {
  era_01_prehistory: [
    {
      id: 'npc_peinan_hunter',
      name: '卑南獵手 · 巴奈',
      role: '部落青年獵人',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'tribal',
      facing: 1,
      talk: '長老！今日在卑南溪捕獲了野鹿，石板棺的大石板也從中央山脈運到了！'
    },
    {
      id: 'npc_shisanhang_smith_apprentice',
      name: '十三行鐵匠 · 阿鐵',
      role: '煉鐵坊夥計',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'smith',
      facing: -1,
      talk: '鼓風爐火力全開！南洋商船帶來的玻璃瑪瑙珠，正等著換我們的鐵鏃！'
    },
    {
      id: 'npc_amis_elder',
      name: '阿美族編織長老 · 督布',
      role: '母系氏族長老',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'tribal_woman',
      facing: 1,
      talk: '年齡階級的青年們正守護著聚落田野，豐收祭的小米陶罐已備齊！'
    },
    {
      id: 'npc_changbin_elder',
      name: '長濱先民 · 達悟老者',
      role: '八仙洞石器長老',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'stone_elder',
      facing: -1,
      talk: '善用堅硬打製石器與火焰，我們在海蝕洞穴生生不息！'
    },
    {
      id: 'npc_taiwan_trader',
      name: '南島遠航水手 · 瓦歷斯',
      role: '黑潮航海勇士',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'tribal_sailor',
      facing: -1,
      talk: '帶著精磨的臺灣閃玉耳飾，我們揚帆渡過巴士海峽前往南洋交換！'
    },
    {
      id: 'npc_raft_ferry',
      name: '卑南溪竹筏手 · 努萬',
      role: '溪流擺渡青年',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'raft_ferry',
      facing: 1,
      talk: '竹筏紮得極牢固，隨時可載運石材與玉料順流而下出海！'
    }
  ],
  era_02_international: [
    {
      id: 'npc_voc_guard',
      name: 'VOC火槍兵 · 范德堡',
      role: '熱蘭遮城衛兵',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'dutch_soldier',
      facing: -1,
      talk: '熱蘭遮城要塞正全面戒備！入港商船皆須繳納什一稅！'
    },
    {
      id: 'npc_candidius_clerk',
      name: '新港社通事 · 尤羅',
      role: '新港文書傳譯',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '以羅馬字母拼寫西拉雅語，我們簽訂土地契約與聖經教化。'
    },
    {
      id: 'npc_siraya_hunter',
      name: '西拉雅獵手 · 塔加',
      role: '新港鹿皮獵人',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'coolie',
      facing: 1,
      talk: '獵鹿季節到了！鹿皮風乾後全送往大員商館外銷日本！'
    },
    {
      id: 'npc_han_farmer',
      name: '赤崁墾民 · 陳阿生',
      role: '移墾佃農',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'coolie',
      facing: -1,
      talk: '荷蘭人的人頭稅實在太苛刻了！郭懷一頭領正召集大夥商量抗稅！'
    },
    {
      id: 'npc_japanese_merchant',
      name: '長崎朱印商船員 · 濱田船員',
      role: '朱印船商行夥計',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'westerner',
      facing: -1,
      talk: '荷蘭VOC竟敢強扣日本船貨稅！幕府將軍絕不姑息！'
    },
    {
      id: 'npc_voc_dockman',
      name: '大員港水手 · 漢斯',
      role: '東印度船理貨員',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'boatman',
      facing: 1,
      talk: '這批鹿皮與白糖即將運往長崎與巴達維亞！快裝箱！'
    }
  ],
  era_03_zheng_regime: [
    {
      id: 'npc_zheng_soldier',
      name: '明鄭鐵人校尉 · 張鐵臂',
      role: '軍屯守禦校尉',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'guard',
      facing: -1,
      talk: '寓兵於農！平時操戈屯墾五穀，戰時披甲誓死反清復明！'
    },
    {
      id: 'npc_salt_worker',
      name: '瀨口曬鹽師 · 李海叔',
      role: '淋鹵曬鹽師傅',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'coolie',
      facing: 1,
      talk: '陳永華參軍教我們改進淋鹵曬鹽法，臺灣終於有雪白食鹽可吃了！'
    },
    {
      id: 'npc_confucian_student',
      name: '全臺首學儒生 · 許文生',
      role: '臺南孔廟舉人',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '全臺首學孔廟落成，設科舉開鄉試，海東文教自此隆興！'
    },
    {
      id: 'npc_sugar_planter',
      name: '承天府糖廍主 · 吳老伯',
      role: '蔗糖榨糖管事',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'coolie',
      facing: -1,
      talk: '臺灣甘蔗甜度極高，蔗糖由東寧商船走私至日本換取軍火鐵料！'
    },
    {
      id: 'npc_british_factor',
      name: '英商代表 · 威爾斯',
      role: '英國東印度商館',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'westerner',
      facing: -1,
      talk: 'We trade arms and cloth with King of Tywan Zheng Jing!'
    },
    {
      id: 'npc_luermen_ferry',
      name: '鹿耳水道水手 · 林老舵',
      role: '鹿耳水道引航員',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'boatman',
      facing: 1,
      talk: '鹿耳門水道曲折莫測，當年國姓爺趁大潮奇兵入港，天佑大明！'
    }
  ],
  era_04_early_qing: [
    {
      id: 'npc_quanzhou_merchant',
      name: '泉郊金長順掌櫃 · 蔡員外',
      role: '鹿港三郊巨賈',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '一府二鹿三艋舺！本郊商號專營對渡泉州，絲綢布匹日進斗金！'
    },
    {
      id: 'npc_zhangzhou_farmer',
      name: '拓墾地主 · 林平水',
      role: '八堡圳分水管事',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'coolie',
      facing: -1,
      talk: '修築八堡圳引濁水溪灌溉，千畝荒埔全變成了豐收良田！'
    },
    {
      id: 'npc_green_standard',
      name: '臺灣鎮標綠營 · 趙參將',
      role: '班兵輪防巡查',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'guard',
      facing: -1,
      talk: '三年一換，不准攜眷！朝廷渡臺禁令嚴格查緝無照偷渡客！'
    },
    {
      id: 'npc_lukang_coolie',
      name: '九曲巷挑夫 · 阿狗',
      role: '杉行力役',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'coolie',
      facing: 1,
      talk: '九曲巷防風又防盜，挑著福州杉走在巷弄可得步步穩當！'
    },
    {
      id: 'npc_aboriginal_trader',
      name: '岸裡社通事 · 潘潘長老',
      role: '熟番總理通事',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'scholar',
      facing: -1,
      talk: '劃界立石、開通水圳，漢番相安共生才是長治久安之道！'
    },
    {
      id: 'npc_dubo_boatman',
      name: '對渡商埠渡伕 · 黃阿伯',
      role: '正口對渡船伕',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'boatman',
      facing: 1,
      talk: '正口對渡！由鹿港直航蚶江，船裝滿了稻米，回程滿載福州杉！'
    }
  ],
  era_05_late_qing: [
    {
      id: 'npc_coolie',
      name: '挑茶苦力 · 阿福',
      role: '碼頭挑夫',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'coolie',
      facing: 1,
      talk: '深坑的烏龍茶剛送到！得趕緊挑去寶順洋行秤重裝箱！'
    },
    {
      id: 'npc_dodd',
      name: '約翰·陶德 (Dodd)',
      role: '洋商創始人',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'westerner',
      facing: -1,
      talk: 'Formosa Oolong tea will conquer New York and London!'
    },
    {
      id: 'npc_comprador',
      name: '買辦 · 李春生',
      role: '茶業買辦',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '承恩，開港乃百年難遇之良機，與洋行聯手方能將臺灣茶推向海外！'
    },
    {
      id: 'npc_apprentice',
      name: '行郊學徒 · 阿木',
      role: '糖郊夥計',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'apprentice',
      facing: -1,
      talk: '掌櫃說過，近來兩岸商路風浪大，郊商銀錢吃緊，還是守成穩健好。'
    },
    {
      id: 'npc_guard',
      name: '正關巡勇 · 杜把總',
      role: '淡水正關巡防',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'guard',
      facing: -1,
      talk: '海關正嚴查無稅私運！膽敢闖入西南私渡口，定依新關章程究辦！'
    },
    {
      id: 'npc_boatman',
      name: '渡船船伕 · 林老漢',
      role: '淡水河擺渡',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'boatman',
      facing: 1,
      talk: '潮水正旺，來往艋舺與滬尾的行商舢舨隨時可渡！'
    }
  ],
  era_06_japanese_rule: [
    {
      id: 'npc_police',
      name: '派出所巡查 · 本田警部',
      role: '總督府保甲警察',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'guard',
      facing: -1,
      talk: '保甲制度衛生臨檢！臨街店鋪必須保持清潔，禁止違規佔道！'
    },
    {
      id: 'npc_cultural_association',
      name: '文協青年 · 蔣書生',
      role: '文化宣傳員',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '讀《臺灣民報》，聽文化演講！同胞須團結，團結真有力！'
    },
    {
      id: 'npc_tea_tycoon',
      name: '永樂茶商 · 陳天來',
      role: '錦記茶行實業家',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'westerner',
      facing: -1,
      talk: '包種茶直銷南洋，巴達維亞商機無限，現代商業必須講求品牌！'
    },
    {
      id: 'npc_railway_staff',
      name: '鐵道部車長 · 佐藤',
      role: '縱貫鐵路列車長',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'apprentice',
      facing: -1,
      talk: '縱貫鐵路全線通車，基隆至高雄朝發夕至，空間革命已成！'
    },
    {
      id: 'npc_sugar_farmer',
      name: '蔗農協會員 · 阿火',
      role: '二林蔗農會員',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'coolie',
      facing: 1,
      talk: '第一憨替人作保，第二憨種甘蔗給糖廠磅！我們絕不屈服於不公！'
    },
    {
      id: 'npc_dadaocheng_modern_girl',
      name: '摩登女郎 · 明子',
      role: '咖啡廳服務員',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'scholar',
      facing: 1,
      talk: '聽黑膠蓄音機，喝摩卡咖啡，大稻埕的新時代真迷人！'
    }
  ],
  era_07_postwar_modern: [
    {
      id: 'npc_hsinchu_engineer',
      name: '晶圓工程師 · 凱文',
      role: '半導體製程研發',
      x: 980,
      y: 220,
      baseX: 980,
      baseY: 220,
      type: 'westerner',
      facing: -1,
      talk: '晶圓良率已突破 98%！臺灣矽島供應鏈正是全球高科技的心臟！'
    },
    {
      id: 'npc_ten_projects_planner',
      name: '工程隊長 · 老孫',
      role: '十大建設工程隊',
      x: 980,
      y: 580,
      baseX: 980,
      baseY: 580,
      type: 'guard',
      facing: -1,
      talk: '高速公路貫通、鋼鐵造船火力全開，奠定臺灣經濟起飛基石！'
    },
    {
      id: 'npc_sme_boss',
      name: '加工廠董座 · 蔡黑手',
      role: '外銷中小企業主',
      x: 380,
      y: 220,
      baseX: 380,
      baseY: 220,
      type: 'apprentice',
      facing: -1,
      talk: '一隻皮箱走遍全球！客廳即工廠，臺灣製洋傘自行車打下世界第一！'
    },
    {
      id: 'npc_democracy_activist',
      name: '雜誌編輯 · 林社論',
      role: '黨外民主推動者',
      x: 820,
      y: 360,
      baseX: 820,
      baseY: 360,
      type: 'scholar',
      facing: 1,
      talk: '解除戒嚴、開放黨禁、落實國會全面改選，民主是臺灣核心價值！'
    },
    {
      id: 'npc_nhi_doctor',
      name: '基層診所醫師 · 吳院長',
      role: '全民健保醫師',
      x: 540,
      y: 680,
      baseX: 540,
      baseY: 680,
      type: 'scholar',
      facing: 1,
      talk: '全民健保讓所有國民病有所醫，是臺灣文明最驕傲的成就！'
    },
    {
      id: 'npc_mrt_station_staff',
      name: '智慧站務員 · 小敏',
      role: '捷運都會交通員',
      x: 820,
      y: 750,
      baseX: 820,
      baseY: 750,
      type: 'boatman',
      facing: 1,
      talk: '嗶卡進站！捷運路網四通八達，乾淨守秩序是臺灣的美麗風景！'
    }
  ]
};

// ======================== 6. 情報資料庫 ========================
const CLUE_DATABASE = {
  clue_lin_petition_draft: {
    id: 'clue_lin_petition_draft',
    name: '臺灣議會設置請願書草案',
    icon: '🎩',
    rarity: 'SSR 議會先驅',
    gameplayTip: '👉 前往【州廳公署】遞交議會設置請願書，運用帝國憲法和平爭取臺灣人民主自治與立法權！',
    historicalLore: '📜 林獻堂自1921年起領導發起共15次「臺灣議會設置請願運動」，為日治時期歷時最長、動員最廣之合法政治爭取。',
    howToGet: '林獻堂開局隨身錦囊 / 議會請願小遊戲'
  },
  clue_goto_three_surveys: {
    id: 'clue_goto_three_surveys',
    name: '總督府三大基礎調查檔案',
    icon: '🎖️',
    rarity: 'SSR 殖民基盤',
    gameplayTip: '👉 前往【州廳政務署】推動土地、戶口與舊慣調查，全面肅清隱田並確立專賣局財政！',
    historicalLore: '📜 後藤新平民政長官以「生物學原則」推行三大調查，奠定日本在臺殖民統治制度與財政自立。',
    howToGet: '後藤新平開局隨身錦囊 / 調查圖冊審核'
  },
  clue_jianji_farmer_union: {
    id: 'clue_jianji_farmer_union',
    name: '臺灣農民組合結盟旗幟',
    icon: '🌾',
    rarity: 'SSR 農民先鋒',
    gameplayTip: '👉 前往【製糖工廠公署】抗議製糖會社壓秤與低價收購，聲援二林蔗農爭取公道秤重！',
    historicalLore: '📜 1925年爆發二林蔗農事件，簡吉等人成立「臺灣農民組合」，帶領廣大蔗農反抗「第一憨，替人作保；第二憨，種甘蔗給會社秤」之剝削。',
    howToGet: '簡吉開局隨身錦囊 / 農民結盟小遊戲'
  },
  clue_changbin_flaked_stone: {
    id: 'clue_changbin_flaked_stone',
    name: '八仙洞海蝕洞穴敲砸石核',
    icon: '🪨',
    rarity: 'SSR 遠古曙光',
    gameplayTip: '👉 前往【八仙洞海蝕洞穴】敲擊礫石打製石器，採集海產並燃起柴火防範野獸！',
    historicalLore: '📜 長濱文化為臺灣已知最古老的舊石器時代文化，以打製石器與用火遺跡聞名。',
    howToGet: '長濱敲砸獵人開局隨身錦囊'
  },
  clue_candidius_sinkang_script: {
    id: 'clue_candidius_sinkang_script',
    name: '新港羅馬字母拼音教本',
    icon: '📖',
    rarity: 'SSR 文書開端',
    gameplayTip: '👉 前往【赤崁市集】以羅馬字母拼寫西拉雅語，教導原住民編寫土地買賣新港文書！',
    historicalLore: '📜 甘治士等荷蘭牧師創製「新港文字」，留存了珍貴的平埔族契約文書長達百餘年。',
    howToGet: '甘治士開局隨身錦囊'
  },
  clue_zhen_soldier_farming: {
    id: 'clue_zhen_soldier_farming',
    name: '東寧各營軍屯墾殖地籍',
    icon: '🌾',
    rarity: 'SSR 屯墾基業',
    gameplayTip: '👉 前往【軍屯拓荒所】疏浚水溝、引水灌溉官田，落實寓兵於農解決糧食危機！',
    historicalLore: '📜 鄭氏來臺推行軍屯制（如左營、前鎮、柳營等），化解大軍缺糧危機，開拓臺灣農業市街。',
    howToGet: '東寧軍墾屯丁開局隨身錦囊'
  },
  clue_guo_liugong_canal: {
    id: 'clue_guo_liugong_canal',
    name: '瑠公圳木梘穿山引水圖',
    icon: '💧',
    rarity: 'SSR 水利奇蹟',
    gameplayTip: '👉 前往【瑠公木梘水圳】架設高架木梘跨河引水，引新店溪水源澆灌臺北盆地萬頃稻田！',
    historicalLore: '📜 郭錫瑠歷經艱辛開鑿瑠公圳，以木梘跨越景美溪引水，成為清領前期臺北盆地最重要水利建設。',
    howToGet: '郭錫瑠開局隨身錦囊'
  },
  clue_lin_shuangwen_seal: {
    id: 'clue_lin_shuangwen_seal',
    name: '天地會順天軍盟誓之印',
    icon: '🚩',
    rarity: 'SSR 民變風雲',
    gameplayTip: '👉 前往【天地會集結點】發動義旗抗暴，聲震全臺，迫使乾隆皇帝派出福康安調大軍渡海！',
    historicalLore: '📜 林爽文事件為清治時期臺灣規模最大的民變，事平後乾隆皇帝將諸羅縣賜名為「嘉義」。',
    howToGet: '林爽文開局隨身錦囊'
  },
  clue_li_chunsheng_tea_export: {
    id: 'clue_li_chunsheng_tea_export',
    name: '大稻埕茶棧精焙配方簿',
    icon: '💼',
    rarity: 'SSR 茶金富商',
    gameplayTip: '👉 前往【寶順茶棧】協助洋商精選安溪茶種烘焙，包裝直銷歐美萬國博覽會！',
    historicalLore: '📜 李春生身為大稻埕著名茶商買辦，熱心公益與市政，奠定大稻埕商業繁榮樞紐地位。',
    howToGet: '李春生開局隨身錦囊'
  },
  clue_mackay_oxford_college: {
    id: 'clue_mackay_oxford_college',
    name: '滬尾偕醫館拔牙鉗與講義',
    icon: '🩺',
    rarity: 'SSR 宣教博愛',
    gameplayTip: '👉 前往【偕醫館】為民眾無痛拔牙行醫，並興建牛津學堂與淡水女學堂引進西方現代科學！',
    historicalLore: '📜 馬偕博士在臺宣教三十年，拔牙兩萬餘顆，創立牛津學堂與全臺第一所女子學校「淡水女學堂」。',
    howToGet: '馬偕博士開局隨身錦囊'
  },
  clue_lei_zhen_free_china: {
    id: 'clue_lei_zhen_free_china',
    name: '《自由中國》創刊號宣言',
    icon: '📰',
    rarity: 'SSR 民主燈塔',
    gameplayTip: '👉 前往【自由出版所】發表言論自由社論，反對威權強人連任，籌組中國民主黨！',
    historicalLore: '📜 雷震主持《自由中國》針砭時政，呼籲落實憲政與政黨政治，雖身陷囹圄卻為臺灣民主播下啟蒙種子。',
    howToGet: '雷震開局隨身錦囊'
  },
  clue_dadaocheng_tea: {
    id: 'clue_dadaocheng_tea',
    name: '大稻埕行商秘笈',
    icon: '📜',
    rarity: 'SSR 必備情報',
    gameplayTip: '👉 快去東北方【寶順洋行】買深坑烏龍茶，利潤極高還能觸發「200% 暴擊」大噴錢！',
    historicalLore: '📜 英國商人陶德把臺灣茶賣到紐約爆紅，大稻埕因此變成臺灣最熱鬧發財的商港！',
    howToGet: '開局新手隨身隨贈 / 碼頭理貨打工'
  },
  clue_western_firms: {
    id: 'clue_western_firms',
    name: '洋行通商備忘錄',
    icon: '🚢',
    rarity: 'SR 商業情報',
    gameplayTip: '👉 外商崇尚契約精神，若能直接對接歐美洋行，外銷利潤比傳統內銷高出數倍！',
    historicalLore: '📜 開港後五大洋行齊聚大稻埕與淡水，以墊款包銷模式迅速擴張茶葉市場。',
    howToGet: '初次走訪【寶順洋行】探聽見聞'
  },
  clue_fujian_guild: {
    id: 'clue_fujian_guild',
    name: '郊商同鄉行情契本',
    icon: '🏮',
    rarity: 'SR 街坊行規',
    gameplayTip: '👉 福建三邑與同安郊商勢力龐大，遵守市集公約能確保老字號商譽不倒。',
    historicalLore: '📜 早期臺灣商業以「郊」為組織中心，兼具公會與同鄉聯誼功能，信用是商號根本。',
    howToGet: '初次走訪【福建同鄉會館】探聽見聞'
  },
  clue_customs_tax: {
    id: 'clue_customs_tax',
    name: '淡水新關章程抄本',
    icon: '📑',
    rarity: 'SR 官府秘函',
    gameplayTip: '👉 官府抓走私很嚴！千萬別去西南方【私渡黑水寨】，走正規海關才能賺大錢！',
    historicalLore: '📜 淡水海關配備巡邏砲船查緝走私，只要守法經商，你的商號權益就有大保障！',
    howToGet: '初次走訪【淡水海關官署】探聽見聞'
  },
  clue_dock_trade: {
    id: 'clue_dock_trade',
    name: '淡水河航道水利簡誌',
    icon: '⚓',
    rarity: 'R 實用資訊',
    gameplayTip: '👉 淡水河潮汐是商船進出關鍵！碼頭是各大商幫流動消息最靈通的聚集地。',
    historicalLore: '📜 1860年代淡水河吃水深，戎克船與平底汽船可直抵大稻埕碼頭裝卸貨。',
    howToGet: '初次走訪【大稻埕碼頭】見聞'
  },
  clue_voc_deer: {
    id: 'clue_voc_deer',
    name: '荷蘭大員商務簿抄件',
    icon: '📜',
    rarity: 'SSR 必備情報',
    gameplayTip: '👉 荷蘭人極需鹿皮銷往日本！前往【熱蘭遮商館】報價，可獲取雙倍貨銀！',
    historicalLore: '📜 17世紀臺灣每年外銷數萬張鹿皮至日本製作武士甲冑，是東亞極為搶手的戰略物資！',
    howToGet: '1642 年時代熱蘭遮商務見聞'
  },
  clue_voc_tariff: {
    id: 'clue_voc_tariff',
    name: '熱蘭遮評議稅章秘笈',
    icon: '🏛️',
    rarity: 'SSR 政務法規',
    gameplayTip: '👉 商船與朱印船抗議人頭苛稅！前往東南方【評議公署】頒布自由轉口稅章，調解制度紛爭，港關稅銀大增！',
    historicalLore: '📜 1628年濱田彌兵衛事件引發關稅衝突，大員評議會政務官需建立合理港關稅則，在公司利潤與國際商貿間取得平衡。',
    howToGet: '1642 年荷蘭政務官專屬錦囊'
  },
  clue_voc_script: {
    id: 'clue_voc_script',
    name: '新港社羅馬字盟約秘本',
    icon: '🏹',
    rarity: 'SSR 部族盟約',
    gameplayTip: '👉 前往西北方【赤崁市集】學習荷蘭羅馬字，簽訂族群土地文書，永保部族獵場自主權！',
    historicalLore: '📜 荷蘭傳教士引入羅馬拼音拼寫西拉雅新港語，使原住民能簽訂正式契約保護土地，流傳百餘年。',
    howToGet: '1642 年時代先鋒專屬錦囊'
  },
  clue_1920_petition: {
    id: 'clue_1920_petition',
    name: '臺灣議會設置請願手冊',
    icon: '📰',
    rarity: 'SSR 啟蒙情報',
    gameplayTip: '👉 走合法憲政路線！在【文協講堂】號召大眾連署，可在州廳獲取極高聲望！',
    historicalLore: '📜 1920年代林獻堂等仕紳連續十餘次向帝國議會請願設立臺灣議會，是臺灣民主自決之濫觴！',
    howToGet: '1920 年時代文化協會見聞'
  },
  clue_1920_gov_ordinance: {
    id: 'clue_1920_gov_ordinance',
    name: '市區改正規劃訓令',
    icon: '🏛️',
    rarity: 'SSR 施政準則',
    gameplayTip: '👉 前往【臺北州廳政務署】依法受理請願書並審定市區改正工程，恪守法制理性！',
    historicalLore: '📜 1920年代地方政務官面臨大正民主憲政請願與大稻埕市區改正規劃的雙重治理考驗。',
    howToGet: '1920 年行政官員專屬錦囊'
  },
  clue_railway_trade: {
    id: 'clue_railway_trade',
    name: '臺灣縱貫鐵路運價則例',
    icon: '🚂',
    rarity: 'SR 實業情報',
    gameplayTip: '👉 鐵路全線貫通讓南北商品24小時抵達！利用火車站調度商品效率翻倍。',
    historicalLore: '📜 1908年縱貫鐵路全通，徹底打破臺灣以往依賴南北沿海航運的地理限制。',
    howToGet: '1920 年時代火車站探索'
  }
};

// ======================== 7. 時代奇物與圖鑑 ========================
const COLLECTIBLE_DATABASE = {
  relic_starter_bamboo_basket: {
    id: 'relic_starter_bamboo_basket',
    name: '傳承深坑採茶簍',
    rarity: '新手傳家寶 ★★★',
    icon: '🧺',
    buff: '初始行商銀兩額外 +30 兩',
    lore: '青年林晨恩出門闖蕩時隨身背負的手編竹茶簍，承載著家族世代茶農的汗水與致富夢想。',
    howToGet: '大稻埕開局新手隨身珍藏'
  },
  relic_tea_seal: {
    id: 'relic_tea_seal',
    name: '寶順洋行通商印記',
    rarity: '珍品文物 ★★★★',
    icon: '💮',
    buff: '茶葉貿易暴擊利潤 +15%',
    lore: '蓋有英國寶順洋行雙語鋼印的通商憑信，是臺灣烏龍茶直銷歐美的通行憑證。',
    howToGet: '達成寶順洋行首期茶葉合約'
  },
  relic_formosa_tea_box: {
    id: 'relic_formosa_tea_box',
    name: '首批外銷烏龍茶箱',
    rarity: '珍品文物 ★★★★',
    icon: '📦',
    buff: '暴擊機率永久 +10%',
    lore: '印著「Formosa Oolong Tea」金龍標籤的外銷茶箱，是臺灣烏龍茶風靡歐美的歷史起點！',
    howToGet: '完成直銷紐約大單交易'
  },
  relic_guild_silver_scale: {
    id: 'relic_guild_silver_scale',
    name: '三邑郊商等子天平',
    rarity: '珍品文物 ★★★★',
    icon: '⚖️',
    buff: '所有商號交易底價 -10%',
    lore: '福建郊商專用的烏木黃銅戥子天平，分釐不差，見證了漢商在河港老街的百年商譽基石。',
    howToGet: '於同鄉會館促成閩商聯保結盟'
  },
  relic_customs_stamp: {
    id: 'relic_customs_stamp',
    name: '淡水稅關驗訖火漆防印',
    rarity: '珍品文物 ★★★★',
    icon: '🏛️',
    buff: '海關與洋行聲望成長 +25%',
    lore: '淡水海關副通判加蓋的正印，象徵合規通商的免扣押豁免特權。',
    howToGet: '平息海關稅務爭端並合法完稅'
  },
  relic_dodd_watch: {
    id: 'relic_dodd_watch',
    name: '陶德的純銀懷錶',
    rarity: '傳奇文物 ★★★★★',
    icon: '⏱️',
    buff: '全交易收益額外 +15%',
    lore: '英國洋行老闆約翰·陶德親手贈予的瑞士純銀懷錶，鐫刻「時間就是財富」！',
    howToGet: '促成大稻埕茶金聯盟或達成先鋒任務'
  },
  relic_voc_silver_coin: {
    id: 'relic_voc_silver_coin',
    name: '荷蘭東印度公司銀杜卡特',
    rarity: '傳奇文物 ★★★★★',
    icon: '🪙',
    buff: '全商貿利潤 +20%',
    lore: '刻有VOC徽記的重磅銀幣，曾是大航海時代遠東與臺灣原住民貿易的國際硬通貨！',
    howToGet: '1642 年時代大員商貿大單'
  },
  relic_silk_measure_rule: {
    id: 'relic_silk_measure_rule',
    name: '永樂町精染黃銅布尺',
    rarity: '珍品文物 ★★★★',
    icon: '📏',
    buff: '實業交易利潤 +15%',
    lore: '大稻埕永樂座布莊掌櫃隨身佩戴的精準銅尺，代表臺灣近代織品工業的萌芽盛景。',
    howToGet: '1920 年代永樂布莊實業拓展'
  },
  relic_taiwan_minpao: {
    id: 'relic_taiwan_minpao',
    name: '創刊號《臺灣民報》',
    rarity: '傳奇文物 ★★★★★',
    icon: '📰',
    buff: '民眾聲望成長 +30%',
    lore: '被譽為「臺灣人唯一的言論機關」，點燃了全島知識分子爭取自治的啟蒙烈火！',
    howToGet: '1920 年代民主自決請願運動'
  }
};

// ======================== 8. 全年代多視角歷史節點數據庫 ========================
const EVENT_NODES = {
  // -------------------------------------------------------------
  // 1869 年 · 平民茶商視角【林承恩】
  // -------------------------------------------------------------
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
          reputationDelta: 15,
          knowledgeDelta: 15,
          gainCollectibleId: 'relic_guild_silver_scale'
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
  },

  // -------------------------------------------------------------
  // 1869 年 · 行政官員視角【沈士彥】（淡水海關副通判）
  // -------------------------------------------------------------
  node_1869_gov_tariff: {
    id: 'node_1869_gov_tariff',
    era: '1869 年春 · 淡水海關官署公堂',
    title: '英商陶德要求減徵茶葉關稅，身為通判該如何定奪？',
    description: '外商以「條約未載明精製茶細則」為由要求豁免茶厘，地方士紳則擔憂利權盡失，請裁定海關稅則！',
    historicalContext: '開港初期，清朝舊式常關與新設洋關摩擦不斷。通判需在朝廷海防經費與洋商條約規範間取得平衡。',
    options: [
      {
        id: 'opt_gov_fair_tax',
        targetLocationId: 'loc_customs',
        text: '【依法核定條約稅則】公平徵收洋茶出口稅，保障商貿暢通並充實海防！',
        badge: '⚖️ 洋務治略',
        requiredClues: ['clue_customs_tax'],
        isHistorical: true,
        baseCost: 60,
        baseSilverReward: 350,
        criticalChance: 0.55,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 45,
          knowledgeDelta: 35,
          gainCollectibleId: 'relic_dodd_watch'
        },
        consequence: {
          narrative: '你的裁決既保障了朝廷稅入，又避免了外事糾紛！英商寶順洋行心服口服繳納稅銀，開港秩序大定！',
          historicalOutcome: '【史實縱覽】淡水新關引入現代稅關制度，為清末臺灣自強新政帶來了豐沛財政基礎。',
          ifOutcome: ''
        },
        nextNodeId: 'node_1869_gov_smuggling'
      },
      {
        id: 'opt_gov_lockout',
        targetLocationId: 'loc_tea_firm',
        text: '【嚴密封港刁難】堅持以傳統舊例百般盤查，禁止洋船裝運。',
        badge: '🏮 閉關守舊',
        requiredClues: [],
        isHistorical: false,
        baseCost: 80,
        baseSilverReward: 120,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -20,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '洋商聯名向總理衙門提出嚴正交涉，總督降旨斥責你「不知通商大體」，官位險遭降調。',
          historicalOutcome: '',
          ifOutcome: '【歷史啟發】開港已成定局，墨守成規只會引發外交危機，主動理解現代法規才能保衛主權。'
        },
        nextNodeId: 'node_1869_gov_smuggling'
      }
    ]
  },
  node_1869_gov_smuggling: {
    id: 'node_1869_gov_smuggling',
    era: '1869 年秋 · 淡水河口巡防戰備',
    title: '查獲武裝私梟勾結外船偷運茶葉，如何依法處置？',
    description: '巡邏水師哨船回報：私渡口有快蟹船夜航走私，企圖逃避海關正稅！',
    historicalContext: '淡水開港後，不少私梟藉由複雜水道走私樟腦與茶葉，海關緝私是整飭治安的第一要務。',
    options: [
      {
        id: 'opt_gov_crackdown',
        targetLocationId: 'loc_smuggler',
        text: '【調遣礮船鐵腕查扣】親臨前線查封私船，查抄走私物資充公！',
        badge: '⚔️ 鐵腕執法',
        requiredClues: [],
        isHistorical: true,
        baseCost: 80,
        baseSilverReward: 420,
        criticalChance: 0.6,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 50,
          knowledgeDelta: 30,
          gainCollectibleId: 'relic_formosa_tea_box'
        },
        consequence: {
          narrative: '巡邏礮船截斷私梟退路，查扣萬斤未稅茶葉！合法商號無不拍手稱快，淡水通商治安威震北臺！',
          historicalOutcome: '【歷史啟發】嚴厲打擊走私，才奠定了大稻埕正規貿易的繁榮基石。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_gov_compromise',
        targetLocationId: 'loc_dock',
        text: '【息事寧人私下調解】僅罰鍰輕放，不予深究。',
        badge: '⚠️ 姑息偏安',
        requiredClues: [],
        isHistorical: false,
        baseCost: 50,
        baseSilverReward: 160,
        criticalChance: 0.1,
        criticalMultiplier: 1.1,
        effects: {
          reputationDelta: -10,
          knowledgeDelta: 15
        },
        consequence: {
          narrative: '私梟食髓知味，數日後再度私運並引發械鬥，海關公信力大打折扣。',
          historicalOutcome: '',
          ifOutcome: '【歷史省思】執法不嚴往往衍生更大社會動盪。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 1869 年 · 時代先鋒人物【李春生】（洋行總買辦・茶業之父）
  // -------------------------------------------------------------
  node_1869_pioneer_tea_process: {
    id: 'node_1869_pioneer_tea_process',
    era: '1869 年夏 · 寶順洋行大烘房',
    title: '臺灣毛茶烘焙粗糙，李春生該如何打破產業瓶頸？',
    description: '陶德欲大批收購外銷，但本地茶農僅採粗製毛茶，運抵海外易受潮變酸，必須進行重大工藝革新！',
    historicalContext: '李春生跨海自福建安溪聘請製茶名師來臺，提供茶農無息貸款，開創臺灣精製烏龍茶的新紀元。',
    options: [
      {
        id: 'opt_pioneer_master_hire',
        targetLocationId: 'loc_tea_firm',
        text: '【引進安溪焙茶大師】貸予茶農資金並親授烘焙法，打造 Formosa Tea 精品！',
        badge: '👑 產業之父',
        requiredClues: ['clue_dadaocheng_tea'],
        isHistorical: true,
        baseCost: 120,
        baseSilverReward: 460,
        criticalChance: 0.7,
        criticalMultiplier: 2.2,
        effects: {
          reputationDelta: 60,
          knowledgeDelta: 40,
          gainCollectibleId: 'relic_formosa_tea_box'
        },
        consequence: {
          narrative: '安溪焙茶技藝讓茶葉香氣濃郁四溢！陶德驚為天人，立刻拍板將這批精焙茶全數裝箱！',
          historicalOutcome: '【史實名人】李春生改善了製茶工藝與融資機制，帶動數萬茶農脫貧致富！',
          ifOutcome: ''
        },
        nextNodeId: 'node_1869_pioneer_trans_ocean'
      },
      {
        id: 'opt_pioneer_raw_export',
        targetLocationId: 'loc_sugar_guild',
        text: '【直接收購未加工毛茶】貪圖省事，不予精製直接裝船。',
        badge: '🏮 短視求售',
        requiredClues: [],
        isHistorical: false,
        baseCost: 70,
        baseSilverReward: 140,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -10,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '毛茶在漫長越洋航程中發霉腐壞，洋行損失慘重，名譽蒙塵。',
          historicalOutcome: '',
          ifOutcome: '【歷史啟發】品質與深加工是本土商品走向國際的唯一生命線。'
        },
        nextNodeId: 'node_1869_pioneer_trans_ocean'
      }
    ]
  },
  node_1869_pioneer_trans_ocean: {
    id: 'node_1869_pioneer_trans_ocean',
    era: '1869 年秋 · 淡水碼頭啟航儀式',
    title: '兩艘滿載烏龍茶的飛剪帆船整裝待發，航向何方？',
    description: '洋行內部爭論：是轉賣近處的香港二手收購商，還是直接包船橫渡大西洋直銷紐約？',
    historicalContext: '直銷紐約是前所未有的創舉，成功讓臺灣茶直接打入歐美主流消費市場。',
    options: [
      {
        id: 'opt_pioneer_sail_ny',
        targetLocationId: 'loc_dock',
        text: '【包船直航美國紐約】揚帆遠洋，將臺灣烏龍茶直接送上萬國舞台！',
        badge: '🗽 名揚萬國',
        requiredClues: ['clue_dadaocheng_tea'],
        isHistorical: true,
        baseCost: 100,
        baseSilverReward: 550,
        criticalChance: 0.75,
        criticalMultiplier: 2.5,
        effects: {
          reputationDelta: 70,
          knowledgeDelta: 50,
          gainCollectibleId: 'relic_dodd_watch'
        },
        consequence: {
          narrative: '飛剪帆船抵達紐約港，Formosa Oolong Tea 瞬間售罄引起轟動！大稻埕自此成為全球茶金之都！',
          historicalOutcome: '【歷史里程碑】1869年直銷紐約，標誌著臺灣正式深度融入世界經濟資本體系。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_pioneer_sell_hk',
        targetLocationId: 'loc_customs',
        text: '【卸貨轉賣香港茶棧】規避遠洋航行風浪，低價轉讓。',
        badge: '⚠️ 保守求安',
        requiredClues: [],
        isHistorical: false,
        baseCost: 60,
        baseSilverReward: 160,
        criticalChance: 0.2,
        criticalMultiplier: 1.1,
        effects: {
          reputationDelta: 10,
          knowledgeDelta: 15
        },
        consequence: {
          narrative: '轉手利潤被香港買辦賺走大半，臺灣茶未能打響自己的獨立國際品牌。',
          historicalOutcome: '',
          ifOutcome: '【歷史啟發】勇於自創品牌航向國際，才是歷史大贏家的魄力！'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 1642 年 · 大航海時代節點
  // -------------------------------------------------------------
  node_1642_deer_tax: {
    id: 'node_1642_deer_tax',
    era: '1642 年秋 · 赤崁大員鹿皮市集',
    title: '荷蘭商館收購鹿皮，漢商何斌如何定價交易？',
    description: '平埔獵戶運來數千張優質鹿皮，荷蘭東印度公司欲以低價壟斷收購，如何抉擇？',
    historicalContext: '17世紀臺灣鹿皮銷往日本製作甲冑，是荷蘭東印度公司在遠東獲利最豐厚的貿易品之一。',
    options: [
      {
        id: 'opt_1642_trade_voc',
        targetLocationId: 'loc_tea_firm',
        text: '【熱蘭遮商館】整合漢商聯合報價，爭取雙贏出口利潤！',
        badge: '👑 貿易先機',
        requiredClues: ['clue_voc_deer'],
        isHistorical: true,
        baseCost: 80,
        baseSilverReward: 300,
        criticalChance: 0.6,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 35,
          knowledgeDelta: 25,
          gainCollectibleId: 'relic_voc_silver_coin'
        },
        consequence: {
          narrative: '荷蘭評議長官同意聯合收購價，數萬張鹿皮裝上荷蘭夾板船銷往長崎，大賺杜卡特銀幣！',
          historicalOutcome: '【大航海時代】臺灣鹿皮貿易讓大員成為荷蘭東印度公司利潤第二高的海外商館！',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_1642_trade_smuggle',
        targetLocationId: 'loc_smuggler',
        text: '【走私偷運泉州】逃避荷蘭公司什稅，鋌而走險。',
        badge: '☠️ 黑市私渡',
        requiredClues: [],
        isHistorical: false,
        baseCost: 70,
        baseSilverReward: 0,
        criticalChance: 0.0,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -30,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '走私快艇在黑水溝遭荷蘭武裝巡邏船查扣，貨銀全失……',
          historicalOutcome: '',
          ifOutcome: '【歷史小百科】荷蘭人在臺海佈署重砲快艇，嚴厲封鎖未稅走私航線。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },
  node_1642_voc_tariff: {
    id: 'node_1642_voc_tariff',
    era: '1642 年秋 · 熱蘭遮城評議會',
    title: '日本朱印船與漢人商船拒繳人頭苛稅，政務官如何裁定法規制度？',
    description: '外來商船抗議荷蘭東印度公司苛徵出口什一稅，大員評議會政務官面臨稅制改革與維護通商秩序的關鍵抉擇！',
    historicalContext: '長官諾伊茨強徵什稅曾引發震驚東亞的「濱田彌兵衛事件」；評議會政務官需權衡公司財政收入與國際通商秩序，裁決合宜法規。',
    options: [
      {
        id: 'opt_1642_voc_reform',
        targetLocationId: 'loc_customs',
        text: '【前往評議公署 · 頒布自由轉口稅章】廢除苛捐人頭稅，改採過境轉口定額低稅率，招徠萬國商船！',
        badge: '⚖️ 審定政規 (推薦)',
        requiredClues: ['clue_voc_tariff'],
        isHistorical: true,
        baseCost: 60,
        baseSilverReward: 350,
        criticalChance: 0.65,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 45,
          knowledgeDelta: 35,
          gainCollectibleId: 'relic_voc_silver_coin'
        },
        consequence: {
          narrative: '你在評議長官公署正式頒布《大員自由轉口稅章》！日本朱印船與各國商船紛紛主動完稅，港關稅銀翻倍暴增，確立了大員良性法制秩序！',
          historicalOutcome: '【史實演進】彈性明智的轉口貿易稅制使大員躍居東亞國際樞紐，奠定荷蘭公司在臺金庫基礎。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_1642_voc_crackdown',
        targetLocationId: 'loc_tea_firm',
        text: '【前往熱蘭遮商館 · 強行苛徵人頭什稅】調遣城堡火槍守軍扣押抗稅船隻，武力強徵稅銀！',
        badge: '⚔️ 專制重稅 (歷史教訓)',
        requiredClues: [],
        isHistorical: false,
        baseCost: 80,
        baseSilverReward: 60,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -35,
          knowledgeDelta: 15
        },
        consequence: {
          narrative: '強硬武力扣船激起日本船員強烈反抗，甚至持刀闖入官廳扣押長官！事件引發幕府暴怒關閉平戶商館，公司蒙受毀滅性貿易封鎖！',
          historicalOutcome: '',
          ifOutcome: '【歷史警示】1628年長官諾伊茨苛稅引發「濱田彌兵衛事件」，致荷日貿易中斷數年，迫使巴達維亞總督撤職賠罪並重定通商法制。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },
  node_1642_tribal_deal: {
    id: 'node_1642_tribal_deal',
    era: '1642 年秋 · 新港社獵場長老會議',
    title: '荷蘭傳教士推行新港文字，長老該如何引導族人？',
    description: '荷蘭傳教士帶來以羅馬拼音拼寫的新港語聖經與契約，長老面臨族群文化轉折點。',
    historicalContext: '新港文書是臺灣原住民留存至今最重要的土地與歷史文字紀錄，使用長達百餘年。',
    options: [
      {
        id: 'opt_1642_learn_script',
        targetLocationId: 'loc_sugar_guild',
        text: '【前往赤崁市集 · 接受新港羅馬字學習】用文字簽訂土地契約，保障族群獵場長久自主權！',
        badge: '🏹 文化傳承 (推薦)',
        requiredClues: ['clue_voc_script'],
        isHistorical: true,
        baseCost: 40,
        baseSilverReward: 260,
        criticalChance: 0.6,
        criticalMultiplier: 1.6,
        effects: {
          reputationDelta: 50,
          knowledgeDelta: 40,
          gainCollectibleId: 'relic_voc_silver_coin'
        },
        consequence: {
          narrative: '族人學會用新港文書立契，有效防止了土地交易中的欺瞞，寫下珍貴的臺灣歷史文獻！',
          historicalOutcome: '【珍貴資產】新港文書見證了臺灣平埔族群吸收拼音文字、保護自身權利的珍貴歷史。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_1642_reject_script',
        targetLocationId: 'loc_smuggler',
        text: '【避入山林 · 拒絕異族文字制度】固守口耳相傳舊例，拒簽任何文字盟約。',
        badge: '🛡️ 守舊避世 (歷史反思)',
        requiredClues: [],
        isHistorical: false,
        baseCost: 50,
        baseSilverReward: 80,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -20,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '缺乏具法律效力的文字契約憑證，日後族人獵場在各方墾拓文書滲透下漸漸遭到蠶食，難以在評議會前力爭權利……',
          historicalOutcome: '',
          ifOutcome: '【歷史反思】新港文書提供原住民族群在制度衝突中保全土地的重要法律憑信，展現早期臺灣跨文化法律智慧。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 1920 年 · 現代化與文協啟蒙節點
  // -------------------------------------------------------------
  node_1920_culture_speech: {
    id: 'node_1920_culture_speech',
    era: '1920 年秋 · 臺北大稻埕港町講演堂',
    title: '文化協會舉辦全島巡迴演講，特高警察臨檢，該如何應對？',
    description: '港町講堂座無虛席，青年們正在演說民主自決與公共衛生，台下便衣警察大喊「注意！中止！」',
    historicalContext: '蔣渭水、林獻堂等人成立文化協會，以合法演講啟發民智，是臺灣近代非武裝抗爭的核心舞台。',
    options: [
      {
        id: 'opt_1920_speak_clever',
        targetLocationId: 'loc_tea_firm',
        text: '【以詼諧隱喻妙語連珠】巧妙避開警察禁用詞，繼續向民眾傳播現代科學新知！',
        badge: '📢 智勇啟蒙',
        requiredClues: ['clue_1920_petition'],
        isHistorical: true,
        baseCost: 50,
        baseSilverReward: 360,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 55,
          knowledgeDelta: 45,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '群眾報以雷鳴般的掌聲與喝采！警察無奈離場，文化協會啟蒙思想傳遍全島大街小巷！',
          historicalOutcome: '【文協風雷】「樂為世界人」的口號激盪無數有志青年，翻開了臺灣現代公民意識的新頁！',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_1920_pass_newspaper',
        targetLocationId: 'loc_smuggler',
        text: '【秘密分發《臺灣民報》】在街頭暗巷散發報刊，擴大啟蒙火種！',
        badge: '🗞️ 宣傳先鋒',
        requiredClues: [],
        isHistorical: true,
        baseCost: 40,
        baseSilverReward: 290,
        criticalChance: 0.5,
        criticalMultiplier: 1.5,
        effects: {
          reputationDelta: 40,
          knowledgeDelta: 35,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '報紙在百姓手中爭相傳閱，《臺灣民報》被譽為全島民眾唯一的喉舌！',
          historicalOutcome: '【歷史回響】報刊成為凝聚臺灣主體意識最重要的輿論重鎮。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },
  node_1920_market_expansion: {
    id: 'node_1920_market_expansion',
    era: '1920 年秋 · 太平町永樂布莊街',
    title: '全島縱貫鐵路通車，布莊掌櫃陳永富如何開拓市場？',
    description: '基隆至高雄鐵路貨運一日可達，傳統布店正面臨日商洋行大批洋布輸入競爭。',
    historicalContext: '鐵路現代化打破了過去區域封閉市場，大稻埕永樂町一躍成為全島最大的布匹批發集散地。',
    options: [
      {
        id: 'opt_1920_railway_express',
        targetLocationId: 'loc_sugar_guild',
        text: '【運用鐵道物流直供全臺】簽訂鐵道貨運包約，搶先鋪貨至中南部各鄉鎮！',
        badge: '🚂 現代實業',
        requiredClues: ['clue_railway_trade'],
        isHistorical: true,
        baseCost: 90,
        baseSilverReward: 390,
        criticalChance: 0.6,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 45,
          knowledgeDelta: 30,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '鐵路貨箱迅速抵達臺中、嘉義與臺南！永樂布莊名揚全島，創造了現代本土商業傳奇！',
          historicalOutcome: '【產業現代化】大稻埕永樂市場成為北臺灣乃至全島現代紡織布匹的樞紐心臟！',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },
  node_1920_gov_modernization: {
    id: 'node_1920_gov_modernization',
    era: '1920 年秋 · 臺北州廳庶務課公堂',
    title: '大稻埕市區改正與臺灣議會請願書遞交，事務官如何裁奪？',
    description: '林獻堂等人遞交第一回臺灣議會設置請願書，同時市區改正下水道與街道拓寬工程正緊鑼密鼓推進。',
    historicalContext: '大正民主時期的文官面臨制度改革與社會思潮的雙重衝擊，是治理現代化的考驗期。',
    options: [
      {
        id: 'opt_1920_gov_process',
        targetLocationId: 'loc_customs',
        text: '【前往州廳政務署 · 依法受理請願呈轉東京】嚴格依憲法請願程序辦理，兼顧市區改正規劃！',
        badge: '🏛️ 憲政理性 (推薦)',
        requiredClues: ['clue_1920_gov_ordinance'],
        isHistorical: true,
        baseCost: 70,
        baseSilverReward: 340,
        criticalChance: 0.5,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 40,
          knowledgeDelta: 40,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '請願書循正式憲政途徑呈送帝國議會，既展現行政理性，也見證了臺灣憲政自決運動的序幕！',
          historicalOutcome: '【歷史省思】臺灣議會請願運動持續14年，深深奠定了臺灣現代民主啟蒙基石。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_1920_gov_suppress',
        targetLocationId: 'loc_smuggler',
        text: '【特高警察強行查扣】以違反治安警察法為由扣押連署書，強行驅散請願代表。',
        badge: '🚨 威權彈壓 (歷史教訓)',
        requiredClues: [],
        isHistorical: false,
        baseCost: 80,
        baseSilverReward: 100,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -30,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '粗暴查扣激起全島知識分子與日本內地開明派議員的強烈譴責，總督府陷入政治被動。',
          historicalOutcome: '',
          ifOutcome: '【歷史小百科】大正民主時期即便總督府多方阻撓，請願團體仍堅持以合法請願行使憲法權利。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },
  // -------------------------------------------------------------
  // 1895~1945 年 · 臺灣議會請願領袖【林獻堂】
  // -------------------------------------------------------------
  node_lin_petition_movement: {
    id: 'node_lin_petition_movement',
    era: '1921 年 · 臺灣議會設置請願運動',
    title: '林獻堂率眾赴日本帝國議會，如何合法爭取臺灣人民主自治權？',
    description: '帝國議會開會在即，總督府威逼利誘要求撤回請願；林獻堂身為霧峰林家領袖，該如何決策？',
    historicalContext: '林獻堂自1921年起連續14年發起15次請願，為日治時期規模最大、歷時最久的非武裝政治社會運動。',
    options: [
      {
        id: 'opt_lin_petition_tokyo',
        targetLocationId: 'loc_customs',
        text: '【赴東京帝國議會正式遞交請願書】聯合日本開明派議員，依憲法爭取在臺設立民選議會！',
        badge: '👑 憲政先驅 (推薦)',
        requiredClues: ['clue_lin_petition_draft'],
        isHistorical: true,
        baseCost: 90,
        baseSilverReward: 460,
        criticalChance: 0.7,
        criticalMultiplier: 2.2,
        effects: {
          reputationDelta: 65,
          knowledgeDelta: 50,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '請願書正式送達日本帝國議會，引起日本政界與國際媒體高度關注！臺灣人的民主自治呼聲響徹東亞！',
          historicalOutcome: '【議會請願運動】奠定了臺灣政治民主啟蒙基石，激勵了文化協會、農民組合等全面蓬勃發展。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_lin_compromise_cancel',
        targetLocationId: 'loc_tea_firm',
        text: '【接受總督府撫慰撤回請願】放棄向帝國議會發聲，安心擔任地方評議會員。',
        badge: '⚠️ 妥協消極',
        requiredClues: [],
        isHistorical: false,
        baseCost: 50,
        baseSilverReward: 120,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -20,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '放棄請願使臺灣喪失了向中央爭取民權的合法支點，總督府專制統治更加肆無忌憚……',
          historicalOutcome: '',
          ifOutcome: '【歷史省思】林獻堂「不屈不撓」堅持15次請願，是臺灣民主自決精神的象徵。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 1895~1945 年 · 總督府民政長官【後藤新平】
  // -------------------------------------------------------------
  node_goto_state_surveys: {
    id: 'node_goto_state_surveys',
    era: '1898 年 · 總督府民政長官公署',
    title: '後藤新平就任民政長官，如何建立現代殖民基盤與財政自立？',
    description: '殖民初期臺灣治安混亂、財政年年依賴日本國庫補貼；後藤新平提出「生物學統治原則」，該如何展開治理？',
    historicalContext: '後藤新平推行土地、戶口與舊慣「三大調查」，掃除隱田擴大稅收，並建立專賣制度使臺灣財政迅速自立。',
    options: [
      {
        id: 'opt_goto_three_surveys_order',
        targetLocationId: 'loc_customs',
        text: '【推行三大基礎調查與專賣制度】展開土地測量、戶口編查，設立鴉片、食鹽與樟腦專賣局！',
        badge: '🏛️ 殖民奠基 (推薦)',
        requiredClues: ['clue_goto_three_surveys'],
        isHistorical: true,
        baseCost: 100,
        baseSilverReward: 480,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 50,
          knowledgeDelta: 55,
          gainCollectibleId: 'relic_guild_silver_scale'
        },
        consequence: {
          narrative: '三大調查精準掌握全臺土地與人口，地稅收入翻倍，專賣局利潤豐厚，臺灣總督府提前達成財政獨立！',
          historicalOutcome: '【制度現代化】後藤新平的改革確立了近代警察保甲體系與度量衡統一，深刻影響了臺灣近代治理架構。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_goto_pure_military_rule',
        targetLocationId: 'loc_smuggler',
        text: '【僅靠純軍隊武力鎮壓】不辦地籍戶籍調查，維持軍事戒嚴管制。',
        badge: '⚔️ 粗暴短視',
        requiredClues: [],
        isHistorical: false,
        baseCost: 90,
        baseSilverReward: 80,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -40,
          knowledgeDelta: 10
        },
        consequence: {
          narrative: '純軍事鎮壓花費浩繁且民怨四起，日本國會強烈質疑，甚至出現「一億元賣掉臺灣」的議論……',
          historicalOutcome: '',
          ifOutcome: '【歷史小常識】後藤新平以科學調查取代單純軍事高壓，奠定總督府長期統治體制。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 1895~1945 年 · 臺灣農民組合代表【簡吉】
  // -------------------------------------------------------------
  node_jian_ji_farmer_union: {
    id: 'node_jian_ji_farmer_union',
    era: '1925 年 · 二林蔗農事件現場',
    title: '製糖會社壟斷壓秤低價收購，簡吉如何帶領農民抗暴爭權利？',
    description: '「第一憨，替人作保；第二憨，種甘蔗給會社秤！」面對林本源製糖會社不公壓秤，農民群情激憤！',
    historicalContext: '1925年二林蔗農事件催生了「臺灣農民組合」，簡吉等人串聯全島蔗農，是日治時期最蓬勃的農民階級抗爭。',
    options: [
      {
        id: 'opt_jianji_strike_union',
        targetLocationId: 'loc_sugar_guild',
        text: '【成立臺灣農民組合聯合拒割罷交】要求公開公正秤量，抗議原料採取區域制度剝削！',
        badge: '🌾 農民覺醒 (推薦)',
        requiredClues: ['clue_jianji_farmer_union'],
        isHistorical: true,
        baseCost: 70,
        baseSilverReward: 420,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 60,
          knowledgeDelta: 45,
          gainCollectibleId: 'relic_taiwan_minpao'
        },
        consequence: {
          narrative: '農民組合迅速在全島成立數十個支部，兩萬農民齊心結盟！製糖會社被迫改善秤量，二林蔗農名揚全臺！',
          historicalOutcome: '【農運高潮】臺灣農民組合成日治時期規模最大的群眾組織，為基層勞苦農民爭取了生存尊嚴。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      },
      {
        id: 'opt_jianji_submit_sugar',
        targetLocationId: 'loc_smuggler',
        text: '【忍氣吞聲任由會社低價壓秤】交出甘蔗，換取微薄糊口錢。',
        badge: '⚠️ 屈從剝削',
        requiredClues: [],
        isHistorical: false,
        baseCost: 50,
        baseSilverReward: 100,
        criticalChance: 0.1,
        criticalMultiplier: 1.0,
        effects: {
          reputationDelta: -25,
          knowledgeDelta: 5
        },
        consequence: {
          narrative: '會社得寸進尺進一步壓低蔗價，蔗農一年辛勞反欠下巨額肥料債務，農村陷入赤貧……',
          historicalOutcome: '',
          ifOutcome: '【歷史警示】團結才能產生力量，二林蔗農的抗爭打破了殖民會社不可挑戰的神話。'
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 史前時代 · 長濱文化敲砸獵人
  // -------------------------------------------------------------
  node_changbin_stone_flaking: {
    id: 'node_changbin_stone_flaking',
    era: '舊石器時代 · 臺東長濱八仙洞海蝕洞',
    title: '八仙洞風浪拍打洞口，長濱獵人如何利用礫石維持生存？',
    description: '海邊巨石累累，獵人需要採集螺貝、狩獵野獸與燃起火堆禦寒防獸，如何選擇石器工藝？',
    historicalContext: '長濱文化是臺灣目前已知最古老的舊石器時代文化（距今約 3 萬至 5000 年），已知用火並使用打製石器。',
    options: [
      {
        id: 'opt_changbin_flake_pebble',
        targetLocationId: 'loc_tea_firm',
        text: '【敲擊礫石打製單面砍砸器與刮削器】以打製石器處理獸皮鹿肉，洞內燃起柴火！',
        badge: '🪨 遠古智慧 (推薦)',
        requiredClues: ['clue_changbin_flaked_stone'],
        isHistorical: true,
        baseCost: 50,
        baseSilverReward: 280,
        criticalChance: 0.6,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 40,
          knowledgeDelta: 35,
          gainCollectibleId: 'relic_starter_bamboo_basket'
        },
        consequence: {
          narrative: '鋒利的打製石器完美剝下鹿皮，溫暖的火堆驅散了寒夜野獸，八仙洞留下了臺灣遠古人類最先驅的足跡！',
          historicalOutcome: '【長濱文化】長濱文化證實了臺灣在舊石器時代即有人類聚落生活，是臺灣史前考古重大里程碑。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 荷治時期 · 新港文字創製牧師【甘治士】
  // -------------------------------------------------------------
  node_candidius_script_mission: {
    id: 'node_candidius_script_mission',
    era: '1627 年 · 新港社教堂講堂',
    title: '甘治士牧師抵達大員，如何為西拉雅族人開創文字紀錄？',
    description: '西拉雅原住民長年口耳相傳母語；甘治士深諳語言隔閡，決定運用羅馬字母拼寫新港語。',
    historicalContext: '甘治士創製「新港文字」，不僅用於傳播基督教，更成為平埔族人與漢人立契交易之法律文字，沿用逾百年。',
    options: [
      {
        id: 'opt_candidius_teach_alphabet',
        targetLocationId: 'loc_sugar_guild',
        text: '【以羅馬字創製新港文字並設立學校】教導族人書寫母語，留存文字契約！',
        badge: '📖 文字文明 (推薦)',
        requiredClues: ['clue_candidius_sinkang_script'],
        isHistorical: true,
        baseCost: 60,
        baseSilverReward: 330,
        criticalChance: 0.65,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 45,
          knowledgeDelta: 45,
          gainCollectibleId: 'relic_voc_silver_coin'
        },
        consequence: {
          narrative: '新港社孩童與長老迅速掌握拼音文字！族人學會簽訂《新港文書》，為臺灣留存了最珍貴的原民土地契約文獻！',
          historicalOutcome: '【新港文書】見證了臺灣平埔原住民族由無文字社會進入文字契約社會的關鍵轉變。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 明鄭時期 · 東寧軍墾屯丁
  // -------------------------------------------------------------
  node_zhen_soldier_farming: {
    id: 'node_zhen_soldier_farming',
    era: '1664 年 · 承天府萬年州軍墾營盤',
    title: '大軍渡海軍糧匱乏，軍墾屯丁如何開荒闢土解決糧荒？',
    description: '鄭經頒布寓兵於農屯墾令，各鎮營盤必須自食其力；屯丁面對雜草叢生的荒原，該如何開墾？',
    historicalContext: '明鄭實施軍屯制（如左營、前鎮、後勁、新營等），兵農合一開闢農田，解決糧荒並奠定臺灣西南部市街聚落。',
    options: [
      {
        id: 'opt_zhen_soldier_build_dike',
        targetLocationId: 'loc_sugar_guild',
        text: '【挖渠築堤開闢官田營盤】疏通野溪引水灌溉，以牛耕法種植稻麥與番薯！',
        badge: '🌾 寓兵於農 (推薦)',
        requiredClues: ['clue_zhen_soldier_farming'],
        isHistorical: true,
        baseCost: 70,
        baseSilverReward: 320,
        criticalChance: 0.6,
        criticalMultiplier: 1.8,
        effects: {
          reputationDelta: 40,
          knowledgeDelta: 35,
          gainCollectibleId: 'relic_chen_tea_pot'
        },
        consequence: {
          narrative: '金黃色的稻穗在軍營周遭豐收！糧荒順利化解，營盤聚落逐漸繁衍為熱鬧的市集鄉鎮！',
          historicalOutcome: '【軍屯聚落】臺灣南部許多地名（如仁武、柳營、前鎮）皆源自明鄭軍屯，奠定農業漢人聚落骨幹。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 清領前期 · 瑠公圳開鑿墾首【郭錫瑠】
  // -------------------------------------------------------------
  node_guo_liugong_build: {
    id: 'node_guo_liugong_build',
    era: '1753 年 · 臺北盆地新店溪畔',
    title: '新店溪地勢陡峭且遇景美溪阻隔，郭錫瑠如何引水灌溉臺北盆地？',
    description: '開鑿石坑遭遇原民衝突與巨石阻礙，且水流需越過景美溪才能抵達大加蚋堡，該如何攻克難關？',
    historicalContext: '郭錫瑠歷時二十餘年開鑿瑠公圳，架設高架木梘橫跨景美溪引水，灌溉臺北盆地萬頃良田。',
    options: [
      {
        id: 'opt_guo_wood_aqueduct',
        targetLocationId: 'loc_sugar_guild',
        text: '【架設高架通水木梘跨河引水】以巨木建造通水槽越過景美溪，開闢瑠公大圳！',
        badge: '💧 水利奇蹟 (推薦)',
        requiredClues: ['clue_guo_liugong_canal'],
        isHistorical: true,
        baseCost: 90,
        baseSilverReward: 410,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 55,
          knowledgeDelta: 45,
          gainCollectibleId: 'relic_guild_silver_scale'
        },
        consequence: {
          narrative: '清水奔流通過高架木梘！清澈的新店溪水滋潤了整個大加蚋堡（臺北盆地），稻米連年大豐收！',
          historicalOutcome: '【瑠公圳奠基】瑠公圳成為北臺灣水利代表，與彰化八堡圳、高雄曹公圳並稱清代臺灣三大水圳。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 清領前期 · 天地會民變領袖【林爽文】
  // -------------------------------------------------------------
  node_lin_shuangwen_uprising: {
    id: 'node_lin_shuangwen_uprising',
    era: '1786 年 · 彰化大里杙莊',
    title: '臺灣知府貪酷搜捕天地會，林爽文如何率眾揭竿起義？',
    description: '地方官吏藉查禁天地會濫捕良民、勒索賄賂，民怨沸騰；大里杙墾首林爽文面臨生死抉擇！',
    historicalContext: '林爽文事件為清代臺灣規模最大民變，歷時逾年，清廷調集福康安大軍平定，乾隆將此列為十全武功並賜名嘉義。',
    options: [
      {
        id: 'opt_lin_revolt_rally',
        targetLocationId: 'loc_smuggler',
        text: '【豎立順天大旗攻入彰化縣城】率天地會結盟起義，開倉賑濟饑民！',
        badge: '🚩 抗暴巨浪 (推薦)',
        requiredClues: ['clue_lin_shuangwen_seal'],
        isHistorical: true,
        baseCost: 80,
        baseSilverReward: 390,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 55,
          knowledgeDelta: 40,
          gainCollectibleId: 'relic_guild_silver_scale'
        },
        consequence: {
          narrative: '義軍連克彰化、淡水廳城，全臺響應！震撼清廷朝野，迫使乾隆調派陝甘總督福康安率精銳渡海！',
          historicalOutcome: '【清代最大民變】促使清廷檢討消極治臺政策，諸羅軍民因助官守城獲乾隆賜名為「嘉義」。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 清領後期 · 大稻埕茶業之父【李春生】
  // -------------------------------------------------------------
  node_li_chunsheng_tea_export: {
    id: 'node_li_chunsheng_tea_export',
    era: '1869 年 · 大稻埕寶順洋行茶棧',
    title: '歐美洋商求購高品質茶葉，李春生如何開拓臺灣烏龍茶直接外銷？',
    description: '傳統粗茶品質參差，李春生深諳英語與洋商契約，該如何整合茶農與烘焙工藝？',
    historicalContext: '李春生協助英商陶德引進安溪茶苗並融資茶農，將精焙烏龍茶以「Formosa Tea」直銷紐約，成為大稻埕茶業巨擘。',
    options: [
      {
        id: 'opt_li_roast_tea_export',
        targetLocationId: 'loc_tea_firm',
        text: '【督造精緻烘焙茶葉並直銷歐美】嚴選春茶炭火精焙，建立大稻埕茶金信譽！',
        badge: '💼 茶金首富 (推薦)',
        requiredClues: ['clue_li_chunsheng_tea_export'],
        isHistorical: true,
        baseCost: 100,
        baseSilverReward: 460,
        criticalChance: 0.7,
        criticalMultiplier: 2.2,
        effects: {
          reputationDelta: 55,
          knowledgeDelta: 50,
          gainCollectibleId: 'relic_formosa_tea_box'
        },
        consequence: {
          narrative: '兩艘滿載精焙烏龍茶的帆船直航紐約獲巨利！李春生成為大稻埕首屈一指的紳商，開創臺灣開港黃金盛世！',
          historicalOutcome: '【經濟重心北移】茶葉大賣使淡水港成為全臺最大進出口關稅來源，臺灣經濟重心正式由南部轉移至北部。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 清領後期 · 宣教醫療先驅【馬偕博士】
  // -------------------------------------------------------------
  node_mackay_clinic_college: {
    id: 'node_mackay_clinic_college',
    era: '1882 年 · 淡水滬尾偕醫館',
    title: '民眾對西洋醫術與教會存有疑慮，馬偕博士如何打開宣教之門？',
    description: '保守士紳抗拒洋教，但底層百姓受瘧疾與蛀牙之苦；馬偕手持拔牙鉗，該如何破除藩籬？',
    historicalContext: '加拿大長老教會宣教師馬偕在臺行醫拔牙兩萬餘顆，設立「滬尾偕醫館」，並創立「牛津學堂」與全臺首座女子學校。',
    options: [
      {
        id: 'opt_mackay_pull_tooth_oxford',
        targetLocationId: 'loc_customs',
        text: '【免費為百姓拔牙行醫＋興辦牛津學堂】以仁愛醫術化解仇洋心防，引進現代西學與女性教育！',
        badge: '🩺 仁醫大愛 (推薦)',
        requiredClues: ['clue_mackay_oxford_college'],
        isHistorical: true,
        baseCost: 70,
        baseSilverReward: 380,
        criticalChance: 0.65,
        criticalMultiplier: 2.0,
        effects: {
          reputationDelta: 65,
          knowledgeDelta: 60,
          gainCollectibleId: 'relic_dodd_watch'
        },
        consequence: {
          narrative: '「寧願燒盡，不願銹壞！」百姓紛紛湧入偕醫館解除牙痛與病痛，牛津學堂培育無數青年，奠定臺灣近代醫療教育基石！',
          historicalOutcome: '【近代醫療教育】馬偕創辦滬尾偕醫館（馬偕醫院前身）與牛津學堂（真理大學前身），開創臺灣女子受教育先河。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  },

  // -------------------------------------------------------------
  // 戰後臺灣 · 自由中國發行人【雷震】
  // -------------------------------------------------------------
  node_lei_zhen_free_press: {
    id: 'node_lei_zhen_free_press',
    era: '1960 年 · 臺北《自由中國》雜誌社',
    title: '面對動員戡亂威權體制，雷震如何秉筆直書爭取憲政自由？',
    description: '強人執意三度連任總統，雷震與殷海光等人連發社論批判，並著手籌組「中國民主黨」，警總大網步步逼近！',
    historicalContext: '雷震創辦《自由中國》半月刊爭取言論自由與憲政民主，因倡組反對黨遭判刑十年，為戰後臺灣民主運動第一位巨擘。',
    options: [
      {
        id: 'opt_lei_publish_editorial',
        targetLocationId: 'loc_smuggler',
        text: '【刊發社論《反對連任》並堅持籌組新黨】結合本省籍與外省籍菁英，開創政黨政治憲政新局！',
        badge: '✒️ 民主火種 (推薦)',
        requiredClues: ['clue_lei_zhen_free_china'],
        isHistorical: true,
        baseCost: 80,
        baseSilverReward: 420,
        criticalChance: 0.7,
        criticalMultiplier: 2.2,
        effects: {
          reputationDelta: 70,
          knowledgeDelta: 65,
          gainCollectibleId: 'relic_constitutional_ballot'
        },
        consequence: {
          narrative: '社論洛陽紙貴！雷震雖被捕入獄十年，但《自由中國》播下的自由民主種子，深深啟發了日後美麗島世代與解嚴民主浪潮！',
          historicalOutcome: '【戰後民主先聲】雷震案是戰後白色恐怖時期爭取民主政黨政治的代表性事件，確立了臺灣爭取憲政人權的道義標竿。',
          ifOutcome: ''
        },
        nextNodeId: 'node_settlement'
      }
    ]
  }
};

// 自動整合 108 課綱全篇章歷史事件節點與情報庫
if (window.TAIWAN_HISTORY_CURRICULUM) {
  if (window.TAIWAN_HISTORY_CURRICULUM.CLUES) {
    Object.assign(CLUE_DATABASE, window.TAIWAN_HISTORY_CURRICULUM.CLUES);
  }
  if (window.TAIWAN_HISTORY_CURRICULUM.EVENT_NODES) {
    Object.assign(EVENT_NODES, window.TAIWAN_HISTORY_CURRICULUM.EVENT_NODES);
  }
}

window.GAME_MODELS = {
  HISTORICAL_ERAS,
  GAME_IDENTITIES,
  PROGRESSION_TIERS,
  MASTER_PROGRESSION_TIERS,
  HOME_TIERS,
  HOME_OUTFITS,
  ERA_MAP_LOCATIONS,
  MAP_LOCATIONS,
  ERA_NPCS,
  CLUE_DATABASE,
  COLLECTIBLE_DATABASE,
  EVENT_NODES
};

