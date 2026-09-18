/**
 * ==============================================================================
 * 臺灣歷史情境模擬 RPG - 國中臺灣史 108 課綱全篇章 39 歷史人物總資料庫
 * (Taiwan History Comprehensive 7-Era Curriculum Database & Review Engine)
 * ==============================================================================
 */

(function (window) {
  'use strict';

  // ==========================================================================
  // 一、 臺灣史長河七大時代篇章 (7 Comprehensive Historical Eras)
  // ==========================================================================
  const CURRICULUM_ERAS = [
    {
      id: 'era_01_prehistory',
      order: 1,
      chapterTitle: '第一章：史前文化與臺灣原住民族',
      periodName: '遠古石器與南島天地',
      timeline: '舊石器時代',
      themeColor: '#10b981',
      icon: '🏺',
      syllabusHighlights: [
        '舊石器時代（長濱文化）使用打製石器、已知用火',
        '新石器時代（大坌坑、卑南、圓山文化）磨製石器、燒製陶器、農業與定居',
        '金屬器時代（十三行文化）煉鐵技術、外洋玻璃珠與唐宋銅錢貿易交換',
        '臺灣原住民族南島語族文化、母系/父系/貴族社會階層組織與祖靈信仰'
      ],
      characterIds: ['peinan_elder', 'shisanhang_smith', 'atayal_chief', 'amis_matriarch', 'paiwan_noble']
    },
    {
      id: 'era_02_international',
      order: 2,
      chapterTitle: '第二章：國際競爭與荷西時期',
      periodName: '大航海時代的海上競逐',
      timeline: '1624 年～1662 年',
      themeColor: '#0284c7',
      icon: '⛵',
      syllabusHighlights: [
        '明將沈有容於澎湖「諭退韋麻郎」確立海禁與澎湖疆界',
        '荷蘭東印度公司（VOC）在大員建熱蘭遮城與普羅民遮城，發展轉口貿易',
        '日本朱印船爭端與「濱田彌兵衛事件」',
        '苛徵人頭稅與「郭懷一事件（赤崁起事）」',
        '傳教士甘治士創製「新港文字」（羅馬拼音），留存西拉雅土地契約'
      ],
      characterIds: ['shen_yourong', 'hamada_yahei', 'coyett', 'candidius', 'guo_huaiyi']
    },
    {
      id: 'era_03_zheng_regime',
      order: 3,
      chapterTitle: '第三章：鄭氏治臺與反清復明',
      periodName: '海上明室與文教奠基',
      timeline: '1661 年～1683 年',
      themeColor: '#e11d48',
      icon: '⚔️',
      syllabusHighlights: [
        '鄭成功渡鹿耳門驅逐荷蘭人，建「一府二縣（承天府、天興縣、萬年縣）」',
        '陳永華輔政：建臺南孔廟「全臺首學」、創科舉制、寓兵於農軍屯、淋鹵曬鹽',
        '鄭經改二縣為二州，參與三藩之亂，與英國東印度公司簽訂通商合約',
        '清廷施琅澎湖海戰大破鄭軍，上呈《臺灣棄留疏》力陳臺灣戰略要地'
      ],
      characterIds: ['zheng_chenggong', 'chen_yonghua', 'zheng_jing', 'shi_lang']
    },
    {
      id: 'era_04_early_qing',
      order: 4,
      chapterTitle: '第四章：清領前期（消極治臺與移民社會）',
      periodName: '封山禁渡與水利墾拓',
      timeline: '1684 年～1858 年',
      themeColor: '#d97706',
      icon: '🌾',
      syllabusHighlights: [
        '消極治臺方針：「渡臺禁令（三禁、禁止攜眷）」與「劃界封山（土牛界溝）」',
        '全臺大型水利灌溉：施世榜八堡圳（濁水溪）、郭錫瑠瑠公圳（新店溪）',
        '三大歷史民變：朱一貴事件（增設彰化縣與淡水廳）、林爽文事件（乾隆賜名嘉義）',
        '「一府二鹿三艋舺」河港興起，郊商公會掌控兩岸米糖貿易與分類械鬥'
      ],
      characterIds: ['gao_gongqian', 'shi_shibang', 'guo_xiliu', 'zhu_yigui', 'lin_shuangwen', 'jiao_merchant']
    },
    {
      id: 'era_05_late_qing',
      order: 5,
      chapterTitle: '第五章：清領後期（開港通商與現代化自強新政）',
      periodName: '茶金崛起與省級自強',
      timeline: '1858 年～1895 年',
      themeColor: '#854d0e',
      icon: '🍵',
      syllabusHighlights: [
        '開港通商四口（淡水、雞籠、安平、打狗），烏龍茶、樟腦、蔗糖三大出口特產',
        '洋行與買辦崛起：英商陶德引進安溪茶苗，李春生烘焙精焙茶直銷紐約',
        '馬偕博士傳教醫療（淡水偕醫館、拔牙、創立牛津學堂與女學堂）',
        '海防轉變：牡丹社事件後沈葆楨「開山撫番、廢渡臺禁令、築億載金城、設臺北府」',
        '丁日昌鋪設電報線與開採煤礦；首任巡撫劉銘傳推動鐵路、新式郵政與清賦'
      ],
      characterIds: ['john_dodd', 'dr_mackay', 'shen_baozhen', 'ding_richang', 'liu_mingchuan']
    },
    {
      id: 'era_06_japanese_rule',
      order: 6,
      chapterTitle: '第六章：日治時期（殖民統治與非武裝抗爭）',
      periodName: '近代水利與民主啟蒙',
      timeline: '1895 年～1945 年',
      themeColor: '#be185d',
      icon: '📢',
      syllabusHighlights: [
        '馬關條約割臺與「臺灣民主國（藍地黃虎旗）」之乙未抗日',
        '後藤新平殖民基盤：土地/戶口/林野三大調查、警察與保甲制度、專賣制度',
        '八田與一技師設計「烏山頭水庫與嘉南大圳」，推行三年輪作給水法',
        '武裝抗日高峰：漢人最後抗日「噍吧哖事件（余清芳）」、原民「霧社事件（莫那・魯道）」',
        '非武裝政治社會運動：林獻堂「臺灣議會設置請願運動」、蔣渭水「臺灣文化協會與《臺灣民報》」',
        '皇民化運動（國語普及、改日本姓名、參拜神社、南進基地化）'
      ],
      characterIds: ['tang_jingsong', 'goto_shimpei', 'yoichi_hatta', 'yu_qingfang', 'mona_rudao', 'lin_xiantang', 'chiang_weishui', 'kobayashi_seizo']
    },
    {
      id: 'era_07_postwar_modern',
      order: 7,
      chapterTitle: '第七章：戰後臺灣（戒嚴體制、民主化與經濟奇蹟）',
      periodName: '解嚴轉型與高科技起飛',
      timeline: '1945 年～21 世紀',
      themeColor: '#4f46e5',
      icon: '🏙️',
      syllabusHighlights: [
        '戰後接收、專賣弊端、惡性物價通膨引發「二二八事件」',
        '陳誠推動土地改革（三七五減租、公地放領、耕者有其田）與幣制改革（四萬換一塊發行新臺幣）',
        '白色恐怖與民主先驅：雷震創辦《自由中國》籌組中國民主黨入獄',
        '經濟轉型奇蹟：孫運璿與李國鼎推動十大建設、成立工研院與新竹科學園區',
        '政治民主化浪潮：蔣經國宣告解除戒嚴與開放報禁黨禁；李登輝推動國會全面改選與公民直選總統'
      ],
      characterIds: ['chen_yi', 'chen_cheng', 'sun_yunsuan_li', 'lei_zhen', 'chiang_chingkuo', 'lee_tenghui']
    }
  ];

  // ==========================================================================
  // 二、 39 位全時代歷史人物完整核心資料庫 (39 Historical Characters)
  // ==========================================================================
  const CURRICULUM_CHARACTERS = {
    // ------------------------- 篇章 1：史前與原住民族 -------------------------
    peinan_elder: {
      id: 'peinan_elder',
      eraId: 'era_01_prehistory',
      name: '卑南玉匠長老',
      title: '新石器玉器宗師',
      stance: 'indigenous_tribal',
      stanceBadge: '🏺 新石器工藝',
      avatar: '📿',
      missionGoal: '磨製珍稀臺灣閃玉飾品，建造石板棺祭祀祖先，建立跨越巴士海峽的玉器貿易網',
      customResourceName: '臺灣豐田閃玉玉胚',
      initialStats: { resource: 180, reputation: 45, historicalInsight: 40 },
      startingClueId: 'clue_peinan_jade_network',
      exclusiveMinigameId: 'game_jade_polishing',
      minigameName: '玉器砂繩切割琢磨',
      examPoints: [
        {
          id: 'exp_01_peinan_01',
          topic: '社會文教',
          standardTerm: '新石器時代卑南文化',
          frequentQuestionNote: '卑南文化出土大量精美玉器、石板棺（拔齒與屈肢葬/仰身直肢葬辨析），並在東南亞多處遺址發現臺灣玉，證明史前海上貿易交流。'
        }
      ],
      firstNodeId: 'node_peinan_craft_trade'
    },
    shisanhang_smith: {
      id: 'shisanhang_smith',
      eraId: 'era_01_prehistory',
      name: '十三行冶鐵匠',
      title: '金屬器時代鐵匠首領',
      stance: 'indigenous_tribal',
      stanceBadge: '🔥 鐵器時代',
      avatar: '⚒️',
      missionGoal: '鼓風高爐精煉磁鐵砂打造鐵製農具獵具，以外洋舶來玻璃珠與唐宋錢幣充實聚落財富',
      customResourceName: '鼓風爐熔鐵熟鐵塊',
      initialStats: { resource: 220, reputation: 40, historicalInsight: 45 },
      startingClueId: 'clue_shisanhang_smelting',
      exclusiveMinigameId: 'game_iron_smelting_bellows',
      minigameName: '煉鐵高爐風門調控',
      examPoints: [
        {
          id: 'exp_01_shisanhang_01',
          topic: '社會文教',
          standardTerm: '金屬器時代十三行文化',
          frequentQuestionNote: '位於新北八里，出土煉鐵爐殘渣、側身屈肢葬、瑪瑙玻璃珠與唐宋開元通寶，證明臺灣與大陸及海外貿易已相當頻繁。'
        }
      ],
      firstNodeId: 'node_shisanhang_metallurgy'
    },
    atayal_chief: {
      id: 'atayal_chief',
      eraId: 'era_01_prehistory',
      name: '泰雅族大頭目',
      title: '彩虹橋獵場守護者',
      stance: 'indigenous_tribal',
      stanceBadge: '🏹 父系部族',
      avatar: '🦅',
      missionGoal: '嚴守部落祖靈規範（gaga），帶領青年巡護高山獵場，傳承織布與紋面成年榮譽',
      customResourceName: '祖靈 gaga 庇佑值',
      initialStats: { resource: 150, reputation: 50, historicalInsight: 35 },
      startingClueId: 'clue_atayal_gaga_oath',
      exclusiveMinigameId: 'game_hunting_tracking',
      minigameName: '深山獵徑巡狩追蹤',
      examPoints: [
        {
          id: 'exp_01_atayal_01',
          topic: '社會文教',
          standardTerm: '泰雅族祖靈信仰 (gaga) 與紋面',
          frequentQuestionNote: '泰雅族為父系社會，以共同祭祀與道德規範 gaga 為核心，男女成年後分別以出草獵首與織布技術獲取紋面資格，方能通過彩虹橋。'
        }
      ],
      firstNodeId: 'node_atayal_gaga_governance'
    },
    amis_matriarch: {
      id: 'amis_matriarch',
      eraId: 'era_01_prehistory',
      name: '阿美族母系長老',
      title: '奇美公廨母系家長',
      stance: 'indigenous_tribal',
      stanceBadge: '🌾 母系社會',
      avatar: '🪶',
      missionGoal: '主持家庭財產繼承與贅婿親族調解，督導部落男子年齡階級集訓守護海疆',
      customResourceName: '部落公廨豐收穀米',
      initialStats: { resource: 170, reputation: 55, historicalInsight: 35 },
      startingClueId: 'clue_amis_age_rank',
      exclusiveMinigameId: 'game_age_rank_drill',
      minigameName: '男子年齡階級戰舞操演',
      examPoints: [
        {
          id: 'exp_01_amis_01',
          topic: '社會文教',
          standardTerm: '阿美族母系社會與年齡階級',
          frequentQuestionNote: '阿美族為母系繼承、招贅婚（男子入贅男方家），但公共事務由嚴密的「男子年齡階級組織」負責防衛與部落決策，非完全女性專制。'
        }
      ],
      firstNodeId: 'node_amis_matriarchy_order'
    },
    paiwan_noble: {
      id: 'paiwan_noble',
      eraId: 'era_01_prehistory',
      name: '排灣族大頭目',
      title: '百步蛇家嗣貴族首領',
      stance: 'indigenous_tribal',
      stanceBadge: '🐍 貴族階層',
      avatar: '👑',
      missionGoal: '依長子長女繼承家名領地，掌管琉璃珠與陶壺世襲重器，統理石板屋聚落租稅',
      customResourceName: '傳家琉璃珠與地租粟',
      initialStats: { resource: 240, reputation: 50, historicalInsight: 40 },
      startingClueId: 'clue_paiwan_totem_status',
      exclusiveMinigameId: 'game_slate_carving_assemble',
      minigameName: '百步蛇石板浮雕裝配',
      examPoints: [
        {
          id: 'exp_01_paiwan_01',
          topic: '社會文教',
          standardTerm: '排灣族階級社會與百步蛇圖騰',
          frequentQuestionNote: '排灣族為嚴密的世襲貴族階級社會（大頭目、貴族、勇士、平民），不分男女由長嗣繼承家業；百步蛇圖騰與琉璃珠為貴族階級專屬標誌。'
        }
      ],
      firstNodeId: 'node_paiwan_noble_estate'
    },

    // ------------------------- 篇章 2：國際競爭與荷西時期 -------------------------
    shen_yourong: {
      id: 'shen_yourong',
      eraId: 'era_02_international',
      name: '沈有容',
      title: '大明浯嶼水師把總名將',
      stance: 'ruler_official',
      stanceBadge: '⚔️ 明代名將',
      avatar: '🛡️',
      missionGoal: '率海師巡航澎湖，以嚴正法理宣諭荷將韋麻郎，無血開城迫使荷艦退出澎湖',
      customResourceName: '明朝海師威信軍糧',
      initialStats: { resource: 300, reputation: 50, historicalInsight: 45 },
      startingClueId: 'clue_shen_yourong_treaty',
      exclusiveMinigameId: 'game_penghu_fleet_confront',
      minigameName: '澎湖海疆戰艦陣列對峙',
      examPoints: [
        {
          id: 'exp_02_shen_01',
          topic: '政治制度',
          standardTerm: '沈有容諭退韋麻郎石碑',
          frequentQuestionNote: '現存於澎湖天后宮的「沈有容諭退韋麻郎」石碑為臺灣現存最古老石碑，證明明朝將澎湖納入海防管轄，荷蘭人隨後才轉往非明朝版圖的大員（臺灣本島）。'
        }
      ],
      firstNodeId: 'node_shen_yourong_negotiate'
    },
    hamada_yahei: {
      id: 'hamada_yahei',
      eraId: 'era_02_international',
      name: '濱田彌兵衛',
      title: '長崎朱印船首航船長',
      stance: 'merchant_trader',
      stanceBadge: '🗡️ 武裝武士',
      avatar: '🌊',
      missionGoal: '抵制荷蘭東印度公司出口什一稅，於熱蘭遮城拔刀挾持長官諾伊茨，維護對日免稅通商權',
      customResourceName: '江戶朱印狀與黃金貨銀',
      initialStats: { resource: 280, reputation: 45, historicalInsight: 45 },
      startingClueId: 'clue_hamada_red_seal_rights',
      exclusiveMinigameId: 'game_zeelandia_hostage_brawl',
      minigameName: '熱蘭遮官舍拔刀突襲',
      examPoints: [
        {
          id: 'exp_02_hamada_01',
          topic: '對外貿易',
          standardTerm: '濱田彌兵衛事件 (1628)',
          frequentQuestionNote: '因荷蘭大員長官諾伊茨向日本朱印船強徵關稅，引發濱田彌兵衛率武士挾持長官，導致幕府一度關閉平戶荷蘭商館，荷方最終退讓妥協。'
        }
      ],
      firstNodeId: 'node_hamada_tariff_revolt'
    },
    coyett: {
      id: 'coyett',
      eraId: 'era_02_international',
      name: '揆一',
      title: '荷蘭東印度公司末代大員長官',
      stance: 'ruler_official',
      stanceBadge: '🏰 殖民總督',
      avatar: '📜',
      missionGoal: '整頓大員熱蘭遮城堡防務，調控數萬張鹿皮外銷長崎利潤，抵禦國姓爺大軍圍城',
      customResourceName: 'VOC東印度重磅銀杜卡特',
      initialStats: { resource: 350, reputation: 35, historicalInsight: 50 },
      startingClueId: 'clue_coyett_defend_zeelandia',
      exclusiveMinigameId: 'game_voc_deer_tax_audit',
      minigameName: '出口鹿皮與人頭稅冊查核',
      examPoints: [
        {
          id: 'exp_02_coyett_01',
          topic: '政治制度',
          standardTerm: '荷治體制與末代長官揆一',
          frequentQuestionNote: '荷蘭人在臺實施「人頭稅」、招漢人開墾並引進「黃牛」耕作，1661-1662年鄭成功圍攻熱蘭遮城9個月，長官揆一最終開城投降簽署締和條約離開臺灣。'
        }
      ],
      firstNodeId: 'node_coyett_siege_governance'
    },
    candidius: {
      id: 'candidius',
      eraId: 'era_02_international',
      name: '甘治士',
      title: '荷蘭改革宗教會宣教牧師',
      stance: 'cultural_pioneer',
      stanceBadge: '📖 宣教開拓',
      avatar: '⛪',
      missionGoal: '深入西拉雅新港社學習原民語言，創製羅馬拼音「新港文字」翻譯聖經並維護族人權利',
      customResourceName: '新港社洗禮教友名冊',
      initialStats: { resource: 160, reputation: 55, historicalInsight: 50 },
      startingClueId: 'clue_sinkang_manuscript_code',
      exclusiveMinigameId: 'game_sinkang_alphabet_typeset',
      minigameName: '新港羅馬拼音活字排印',
      examPoints: [
        {
          id: 'exp_02_candidius_01',
          topic: '社會文教',
          standardTerm: '新港文字（新港文書 / 番仔契）',
          frequentQuestionNote: '荷蘭牧師以羅馬字母拼寫西拉雅平埔語進行傳教，該文字後來被族人用以書寫土地買賣契約「新港文書」，在民間持續沿用至清領中後期長達百餘年。'
        }
      ],
      firstNodeId: 'node_candidius_script_mission'
    },
    guo_huaiyi: {
      id: 'guo_huaiyi',
      eraId: 'era_02_international',
      name: '郭懷一',
      title: '赤崁漢人開墾首領',
      stance: 'rebel_leader',
      stanceBadge: '⚔️ 起事抗暴',
      avatar: '🔥',
      missionGoal: '號召數千名受苛捐雜稅壓迫的漢人蔗農，揭竿夜襲普羅民遮城反抗荷蘭殖民暴政',
      customResourceName: '起事義民竹竿槍兵額',
      initialStats: { resource: 190, reputation: 60, historicalInsight: 40 },
      startingClueId: 'clue_guo_huaiyi_uprising',
      exclusiveMinigameId: 'game_chikan_night_raid',
      minigameName: '赤崁蔗田夜襲伏擊',
      examPoints: [
        {
          id: 'exp_02_guo_01',
          topic: '族群抗爭',
          standardTerm: '郭懷一事件 (1652)',
          frequentQuestionNote: '荷蘭統治下苛徵「人頭稅」與限制漢人自由，郭懷一率數千漢農起事圍攻赤崁，後遭荷軍聯合金聯平埔族部隊鎮壓犧牲，為荷治時期最大規模反荷事件。'
        }
      ],
      firstNodeId: 'node_guo_huaiyi_strike'
    },

    // ------------------------- 篇章 3：鄭氏治臺與反清復明 -------------------------
    zheng_chenggong: {
      id: 'zheng_chenggong',
      eraId: 'era_03_zheng_regime',
      name: '鄭成功',
      title: '延平王 · 國姓爺',
      stance: 'ruler_official',
      stanceBadge: '👑 明室延平',
      avatar: '🐉',
      missionGoal: '率海師乘海水大潮奇襲鹿耳門，驅逐荷蘭紅毛番，建立臺灣第一個漢人儒家政權',
      customResourceName: '反清復明精銳鐵甲軍餉',
      initialStats: { resource: 400, reputation: 65, historicalInsight: 50 },
      startingClueId: 'clue_zheng_luermen_tide',
      exclusiveMinigameId: 'game_luermen_tide_navigation',
      minigameName: '鹿耳門險礁順潮搶渡',
      examPoints: [
        {
          id: 'exp_03_zheng_01',
          topic: '政治制度',
          standardTerm: '鄭成功驅荷與一府二縣',
          frequentQuestionNote: '1661年鄭成功攻臺驅逐荷蘭，將赤崁改為「承天府」，並設「天興縣、萬年縣」，澎湖設安撫司，建立臺灣首個漢人政權，尊奉南明永曆年號。'
        }
      ],
      firstNodeId: 'node_zheng_admin_setup'
    },
    chen_yonghua: {
      id: 'chen_yonghua',
      eraId: 'era_03_zheng_regime',
      name: '陳永華',
      title: '諮議參軍 · 鄭氏諸葛',
      stance: 'ruler_official',
      stanceBadge: '🏛️ 宰相治略',
      avatar: '📜',
      missionGoal: '規劃全臺首學孔廟推行科舉，推動「寓兵於農」軍屯自給自足，改良淋鹵曬鹽造福萬民',
      customResourceName: '全臺首學太學儒風值',
      initialStats: { resource: 350, reputation: 60, historicalInsight: 55 },
      startingClueId: 'clue_chen_salt_tillage_plan',
      exclusiveMinigameId: 'game_sea_salt_evaporation',
      minigameName: '瓦盤曬鹽海水淋鹵結晶',
      examPoints: [
        {
          id: 'exp_03_chen_01',
          topic: '社會文教',
          standardTerm: '全臺首學（臺南孔廟）與軍屯制度',
          frequentQuestionNote: '陳永華建議建臺南孔廟創立科舉制度（稱為全臺首學）；推行軍屯（留下新營、柳營、左營等現代地名）；並引進淋鹵曬鹽技術改善民生。'
        }
      ],
      firstNodeId: 'node_chen_education_salt'
    },
    zheng_jing: {
      id: 'zheng_jing',
      eraId: 'era_03_zheng_regime',
      name: '鄭經',
      title: '潮王 · 延平王嗣君',
      stance: 'ruler_official',
      stanceBadge: '⛵ 海洋君主',
      avatar: '🚢',
      missionGoal: '拓展一府二州行政體制，與英國東印度公司簽約通商，突破清廷遷界令海外走私貿易',
      customResourceName: '東南亞走私船隊貨值',
      initialStats: { resource: 320, reputation: 45, historicalInsight: 45 },
      startingClueId: 'clue_zheng_jing_uk_trade',
      exclusiveMinigameId: 'game_english_firm_negotiation',
      minigameName: '英國東印度公司火器通商條約簽署',
      examPoints: [
        {
          id: 'exp_03_jing_01',
          topic: '政治制度',
          standardTerm: '一府二州與對英通商',
          frequentQuestionNote: '鄭經繼位後改天興、萬年二縣為「天興州、萬年州」；面對清廷海禁遷界令，積極與日本、英國東印度公司開展海洋貿易，並渡海參與三藩之亂。'
        }
      ],
      firstNodeId: 'node_zheng_jing_foreign_trade'
    },
    shi_lang: {
      id: 'shi_lang',
      eraId: 'era_03_zheng_regime',
      name: '施琅',
      title: '大清福建水師提督 · 靖海侯',
      stance: 'ruler_official',
      stanceBadge: '🌊 靖海水師',
      avatar: '⚓',
      missionGoal: '利用夏季西南季風發動澎湖海戰大破劉國軒，撰寫《臺灣棄留疏》力陳不可棄臺',
      customResourceName: '大清八旗綠營水師兵力',
      initialStats: { resource: 380, reputation: 35, historicalInsight: 50 },
      startingClueId: 'clue_shi_lang_taiwan_memorial',
      exclusiveMinigameId: 'game_penghu_naval_wind_drift',
      minigameName: '澎湖海戰西南季風迎風包夾',
      examPoints: [
        {
          id: 'exp_03_shi_01',
          topic: '政治制度',
          standardTerm: '澎湖海戰與《臺灣棄留疏》',
          frequentQuestionNote: '1683年施琅在澎湖海戰大敗鄭軍水師，鄭克塽投降清朝。面對朝廷大臣「棄臺議」，施琅上奏《臺灣棄留疏》強調「棄之必釀大禍，留之可衛東南」，康熙皇帝遂設一府三縣納入版圖。'
        }
      ],
      firstNodeId: 'node_shi_lang_memorial_decision'
    },

    // ------------------------- 篇章 4：清領前期（消極治臺與移民社會） -------------------------
    gao_gongqian: {
      id: 'gao_gongqian',
      eraId: 'era_04_early_qing',
      name: '高拱乾',
      title: '康熙朝臺灣知府',
      stance: 'ruler_official',
      stanceBadge: '🏛️ 地方知府',
      avatar: '📜',
      missionGoal: '修纂第一部官修《臺灣府志》，嚴格執行渡臺三禁防範民亂，劃定土牛界溝隔離生番',
      customResourceName: '知府庫銀與封山界樁',
      initialStats: { resource: 280, reputation: 45, historicalInsight: 50 },
      startingClueId: 'clue_gao_border_trench_law',
      exclusiveMinigameId: 'game_tuniu_boundary_trench',
      minigameName: '土牛界溝深壕挑挖標界',
      examPoints: [
        {
          id: 'exp_04_gao_01',
          topic: '政治制度',
          standardTerm: '渡臺禁令與土牛界線',
          frequentQuestionNote: '清廷初期消極治臺：頒布「渡臺三禁」（嚴禁攜眷、需照單過海、禁潮惠之地），造成臺灣男女比例失衡（羅漢腳盛行）；劃定「土牛紅線（深溝堆土）」隔離漢番避免衝突。'
        }
      ],
      firstNodeId: 'node_gao_border_regulation'
    },
    shi_shibang: {
      id: 'shi_shibang',
      eraId: 'era_04_early_qing',
      name: '施世榜',
      title: '彰化大墾首 · 八堡圳開鑿者',
      stance: 'civilian_elite',
      stanceBadge: '🌾 興修水利',
      avatar: '🌊',
      missionGoal: '引濁水溪奔流活水，運用林先生笱籠傳奇壩法，開鑿灌溉八個堡的巨大水圳網絡',
      customResourceName: '八堡圳引水斗渠水量',
      initialStats: { resource: 310, reputation: 60, historicalInsight: 45 },
      startingClueId: 'clue_shi_babao_canal_tech',
      exclusiveMinigameId: 'game_bamboo_basket_dam',
      minigameName: '倒圓錐竹笱攔水排石工程',
      examPoints: [
        {
          id: 'exp_04_shi_01',
          topic: '水利農業',
          standardTerm: '八堡圳（施厝圳）與濁水溪',
          frequentQuestionNote: '施世榜集資引濁水溪水開鑿「八堡圳」（又名施厝圳），灌溉彰化平原八個堡，使彰化成為清代臺灣中部的米倉。'
        }
      ],
      firstNodeId: 'node_shi_babao_construction'
    },
    guo_xiliu: {
      id: 'guo_xiliu',
      eraId: 'era_04_early_qing',
      name: '郭錫瑠',
      title: '臺北盆地大墾首 · 瑠公圳之父',
      stance: 'civilian_elite',
      stanceBadge: '🏞️ 穿山引水',
      avatar: '⛏️',
      missionGoal: '鑿穿石壁開闢碧潭水圳，架設木梘水橋飛渡景美溪，徹底滋潤臺北盆地萬畝良田',
      customResourceName: '木梘引水通渠進度',
      initialStats: { resource: 290, reputation: 60, historicalInsight: 45 },
      startingClueId: 'clue_guo_liugong_canal_plan',
      exclusiveMinigameId: 'game_wooden_aqueduct_bridge',
      minigameName: '景美溪木梘水槽防漏拼接',
      examPoints: [
        {
          id: 'exp_04_guo_01',
          topic: '水利農業',
          standardTerm: '瑠公圳與新店溪',
          frequentQuestionNote: '郭錫瑠引新店溪水源開鑿「瑠公圳」，利用水梘（水橋）克服景美溪地形阻隔，解決臺北盆地農田灌溉問題。'
        }
      ],
      firstNodeId: 'node_guo_liugong_build'
    },
    zhu_yigui: {
      id: 'zhu_yigui',
      eraId: 'era_04_early_qing',
      name: '朱一貴',
      title: '鴨母王 · 國姓再世',
      stance: 'rebel_leader',
      stanceBadge: '🦆 揭竿民變',
      avatar: '🚩',
      missionGoal: '因知府苛政橫徵暴斂，號召養鴨農民竹竿為矛起事，數日間橫掃全島攻佔臺灣府城',
      customResourceName: '養鴨陣旗與起事義軍',
      initialStats: { resource: 180, reputation: 65, historicalInsight: 35 },
      startingClueId: 'clue_zhu_yigui_duck_flag',
      exclusiveMinigameId: 'game_duck_army_formation',
      minigameName: '竹管哨音指揮鴨群軍陣',
      examPoints: [
        {
          id: 'exp_04_zhu_01',
          topic: '族群抗爭',
          standardTerm: '朱一貴事件（清代首起大規模民變）',
          frequentQuestionNote: '清領初期「三年一小反，五年一大亂」，朱一貴事件為臺灣首起大規模民變，清廷隨後在防守考量下增設「彰化縣」與「淡水廳」，擴大對中北部的行政管轄。'
        }
      ],
      firstNodeId: 'node_zhu_yigui_rebellion'
    },
    lin_shuangwen: {
      id: 'lin_shuangwen',
      eraId: 'era_04_early_qing',
      name: '林爽文',
      title: '天地會臺灣北路大元帥',
      stance: 'rebel_leader',
      stanceBadge: '⚔️ 會黨起義',
      avatar: '🗡️',
      missionGoal: '領導天地會反清大起事，攻克大墩與諸羅城堡，震撼乾隆王朝十全武功大軍',
      customResourceName: '天地會結盟血書誓章',
      initialStats: { resource: 200, reputation: 65, historicalInsight: 40 },
      startingClueId: 'clue_lin_tiandihui_pledge',
      exclusiveMinigameId: 'game_zhuluo_siege_breakthrough',
      minigameName: '諸羅城破城突圍夜襲',
      examPoints: [
        {
          id: 'exp_04_lin_01',
          topic: '族群抗爭',
          standardTerm: '林爽文事件與諸羅改名嘉義',
          frequentQuestionNote: '林爽文事件為清代規模最大、耗時最久的民變，乾隆皇帝派陜甘總督福康安率精銳渡海平定；因諸羅軍民合力守城抵抗，乾隆皇帝特賜名「諸羅」為「嘉義」（嘉獎其義）。'
        }
      ],
      firstNodeId: 'node_lin_shuangwen_uprising'
    },
    jiao_merchant: {
      id: 'jiao_merchant',
      eraId: 'era_04_early_qing',
      name: '郊商會首',
      title: '一府二鹿三艋舺 · 頂下郊商人',
      stance: 'merchant_trader',
      stanceBadge: '🏮 郊商同盟',
      avatar: '⚖️',
      missionGoal: '組建南郊北郊商會掌控米糖對渡壟斷，調解泉漳分類械鬥，在頂下郊拚中保衛家族商行',
      customResourceName: '公局郊行抽分商稅銀',
      initialStats: { resource: 330, reputation: 50, historicalInsight: 45 },
      startingClueId: 'clue_jiao_trade_manifest',
      exclusiveMinigameId: 'game_junk_boat_cargo_sort',
      minigameName: '橫渡黑水溝戎克船理貨分配',
      examPoints: [
        {
          id: 'exp_04_jiao_01',
          topic: '對外貿易',
          standardTerm: '一府二鹿三艋舺與郊商體制',
          frequentQuestionNote: '清代中期商業興盛，形成「一府（臺南）、二鹿（鹿港）、三艋舺（臺北）」三大港口；商人們依貿易對象與貨品組成商業同業公會「郊」（如北郊、糖郊）；常因同鄉與碼頭利益爆發分類械鬥（如艋舺頂下郊拚）。'
        }
      ],
      firstNodeId: 'node_jiao_merchant_market'
    },

    // ------------------------- 篇章 5：清領後期（開港通商與現代化） -------------------------
    john_dodd: {
      id: 'john_dodd',
      eraId: 'era_05_late_qing',
      name: '約翰·陶德',
      title: '英商寶順洋行負責人',
      stance: 'merchant_trader',
      stanceBadge: '🍵 茶金開拓',
      avatar: '🎩',
      missionGoal: '引進安溪茶苗無息融資茶農，攜手買辦李春生在大稻埕精製 Formosa Oolong Tea 直銷紐約',
      customResourceName: '洋行英鎊匯票與烏龍茶單',
      initialStats: { resource: 340, reputation: 45, historicalInsight: 50 },
      startingClueId: 'clue_dodd_tea_contract',
      exclusiveMinigameId: 'game_tea_roasting_fire',
      minigameName: '炭火焙籠精焙烏龍茶香',
      examPoints: [
        {
          id: 'exp_05_dodd_01',
          topic: '對外貿易',
          standardTerm: '開港通商四口與茶葉外銷',
          frequentQuestionNote: '英法聯軍後簽訂《天津條約》與《北京條約》，臺灣開放基隆、淡水、安平、打狗四口；陶德與李春生開創茶葉直銷歐美，取代過去依賴大陸市場，臺灣貿易由入超轉為出超，促成經濟重心「由南向北轉移」。'
        }
      ],
      firstNodeId: 'node_dodd_tea_export'
    },
    dr_mackay: {
      id: 'dr_mackay',
      eraId: 'era_05_late_qing',
      name: '馬偕博士',
      title: '加拿大長老教會宣教醫療先鋒',
      stance: 'cultural_pioneer',
      stanceBadge: '🏥 現代文教',
      avatar: '🩺',
      missionGoal: '以一把拔牙鉗免費救治北臺萬民，創辦「偕醫館」、「牛津學堂」與「淡水女學堂」啟發男女民智',
      customResourceName: '拔牙行醫救濟病患信賴值',
      initialStats: { resource: 200, reputation: 70, historicalInsight: 55 },
      startingClueId: 'clue_mackay_oxford_college',
      exclusiveMinigameId: 'game_tooth_extraction_clinic',
      minigameName: '巡迴露天無痛拔牙診療',
      examPoints: [
        {
          id: 'exp_05_mackay_01',
          topic: '社會文教',
          standardTerm: '馬偕與牛津學堂、偕醫館',
          frequentQuestionNote: '馬偕以醫療傳教（拔牙數萬顆）、創辦「偕醫館」（馬偕醫院前身）、創設「理學堂大書院（牛津學堂，真理大學前身）」及「淡水女學堂」，開臺灣女子西方現代學校教育之先河。'
        }
      ],
      firstNodeId: 'node_mackay_clinic_college'
    },
    shen_baozhen: {
      id: 'shen_baozhen',
      eraId: 'era_05_late_qing',
      name: '沈葆楨',
      title: '大清欽差海防大臣',
      stance: 'ruler_official',
      stanceBadge: '🏛️ 開山撫番',
      avatar: '🏰',
      missionGoal: '牡丹社事件後奉旨來臺督辦海防，廢除渡臺禁令招墾，開鑿北中南三路山道，修築億載金城',
      customResourceName: '總理各國事務衙門洋務銀',
      initialStats: { resource: 380, reputation: 50, historicalInsight: 55 },
      startingClueId: 'clue_shen_coastal_defense',
      exclusiveMinigameId: 'game_yidaicheng_cannon_aim',
      minigameName: '安平億載金城阿姆斯特朗大砲校準',
      examPoints: [
        {
          id: 'exp_05_shen_01',
          topic: '政治制度',
          standardTerm: '牡丹社事件與沈葆楨開山撫番',
          frequentQuestionNote: '1874年日本藉牡丹社事件侵臺，清廷轉為積極治臺；沈葆楨奏請「廢除渡臺禁令」、「開山撫番（修北中南路）」、「建二鯤鯓砲臺（億載金城）」並「增設臺北府與恆春縣」，奠定防務重心。'
        }
      ],
      firstNodeId: 'node_shen_baozhen_reforms'
    },
    ding_richang: {
      id: 'ding_richang',
      eraId: 'era_05_late_qing',
      name: '丁日昌',
      title: '大清福建巡撫',
      stance: 'ruler_official',
      stanceBadge: '⚡ 洋務通訊',
      avatar: '📟',
      missionGoal: '鋪設旗後至安平府城電報線，引進英國蒸汽採煤機官辦基隆八斗子煤礦，推動新式海關洋務',
      customResourceName: '電報架線里程與八斗子官煤',
      initialStats: { resource: 320, reputation: 45, historicalInsight: 50 },
      startingClueId: 'clue_ding_telegraph_wire',
      exclusiveMinigameId: 'game_morse_telegraph_relay',
      minigameName: '旗後臺灣首條電報線摩斯電碼收發',
      examPoints: [
        {
          id: 'exp_05_ding_01',
          topic: '水利農業',
          standardTerm: '丁日昌鋪設電報線與基隆煤礦',
          frequentQuestionNote: '丁日昌推動洋務新政：架設臺灣第一條電報線（臺南府城至旗後，非全臺貫通）、於基隆八斗子開辦全中國第一座使用蒸汽動力的現代官辦煤礦。'
        }
      ],
      firstNodeId: 'node_ding_richang_industry'
    },
    liu_mingchuan: {
      id: 'liu_mingchuan',
      eraId: 'era_05_late_qing',
      name: '劉銘傳',
      title: '臺灣首任巡撫',
      stance: 'ruler_official',
      stanceBadge: '🚂 建省自強',
      avatar: '🚂',
      missionGoal: '推動自強新政，督造基隆至新竹鐵路，創立大清第一個新式郵政局，丈量田畝推動清賦',
      customResourceName: '建省自強洋務經費庫銀',
      initialStats: { resource: 400, reputation: 50, historicalInsight: 55 },
      startingClueId: 'clue_liu_railway_blueprint',
      exclusiveMinigameId: 'game_steam_train_track',
      minigameName: '獅球嶺隧道騰雲號軌道鋪設',
      examPoints: [
        {
          id: 'exp_05_liu_01',
          topic: '政治制度',
          standardTerm: '臺灣建省與首任巡撫',
          frequentQuestionNote: '中法戰爭後清廷體認臺灣重要性，1885年宣佈臺灣建省，1887年正式設省，劉銘傳為首任巡撫。'
        },
        {
          id: 'exp_05_liu_02',
          topic: '對外貿易',
          standardTerm: '基隆至新竹鐵路與新式郵政局',
          frequentQuestionNote: '劉銘傳在臺興築第一條客運鐵路（基隆至新竹段通車，後任巡撫邵友濂修至新竹停止）、創辦新式郵政局發行郵票、設電報局、成立撫墾局與西學堂。'
        }
      ],
      firstNodeId: 'node_liu_railway_decision'
    },

    // ------------------------- 篇章 6：日治時期（殖民體制與非武裝抗爭） -------------------------
    tang_jingsong: {
      id: 'tang_jingsong',
      eraId: 'era_06_japanese_rule',
      name: '唐景崧',
      title: '臺灣民主國首任大總統',
      stance: 'ruler_official',
      stanceBadge: '🐯 民主國抗割',
      avatar: '🐅',
      missionGoal: '甲午戰敗馬關條約割臺，升起藍地黃虎旗發表獨立宣言，團結士紳軍民開展乙未抗日防衛',
      customResourceName: '黑旗軍與民主國餉銀',
      initialStats: { resource: 280, reputation: 50, historicalInsight: 45 },
      startingClueId: 'clue_tang_yellow_tiger_flag',
      exclusiveMinigameId: 'game_tiger_flag_muster',
      minigameName: '藍地黃虎旗全島防務整飭',
      examPoints: [
        {
          id: 'exp_06_tang_01',
          topic: '政治制度',
          standardTerm: '馬關條約割臺與臺灣民主國',
          frequentQuestionNote: '1895年甲午戰敗簽訂《馬關條約》將臺灣澎湖割讓日本；丘逢甲、唐景崧等人成立「臺灣民主國」（年號永清、國旗藍地黃虎旗），唐景崧任總統、劉永福任大將軍，爆發「乙未戰爭」。'
        }
      ],
      firstNodeId: 'node_tang_republic_declare'
    },
    goto_shimpei: {
      id: 'goto_shimpei',
      eraId: 'era_06_japanese_rule',
      name: '後藤新平',
      title: '臺灣總督府民政長官',
      stance: 'ruler_official',
      stanceBadge: '📊 殖民行政',
      avatar: '🧐',
      missionGoal: '運用生物學治理原則，推動「土地、戶口、林野」三大基礎調查，確立警察保甲與專賣制度',
      customResourceName: '總督府國庫金與專賣利潤',
      initialStats: { resource: 420, reputation: 35, historicalInsight: 55 },
      startingClueId: 'clue_goto_three_surveys',
      exclusiveMinigameId: 'game_land_census_survey',
      minigameName: '戶口與土地隱田丈量調查',
      examPoints: [
        {
          id: 'exp_06_goto_01',
          topic: '政治制度',
          standardTerm: '後藤新平三大基礎調查與保甲制度',
          frequentQuestionNote: '後藤新平擔任民政長官時推行「三大調查（土地調查、戶口調查、林野調查）」掃除隱田擴大稅收；強化「警察與保甲制度（連坐法）」徹底控制地方基層；設立鴉片、食鹽、樟腦、菸酒專賣制度。'
        }
      ],
      firstNodeId: 'node_goto_state_surveys'
    },
    yoichi_hatta: {
      id: 'yoichi_hatta',
      eraId: 'era_06_japanese_rule',
      name: '八田與一',
      title: '總督府技師 · 嘉南大圳之父',
      stance: 'ruler_official',
      stanceBadge: '🌊 近代水利',
      avatar: '🌊',
      missionGoal: '規劃設計亞洲第一的烏山頭水庫半水力填築壩，以「三年輪作給水法」將嘉南不毛之田化為肥沃米倉',
      customResourceName: '嘉南大圳引水工程金',
      initialStats: { resource: 360, reputation: 55, historicalInsight: 50 },
      startingClueId: 'clue_wusanto_blueprint',
      exclusiveMinigameId: 'game_three_year_crop_rotation',
      minigameName: '水稻甘蔗雜糧三年給水水閘調控',
      examPoints: [
        {
          id: 'exp_06_hatta_01',
          topic: '水利農業',
          standardTerm: '烏山頭水庫與三年輪作給水法',
          frequentQuestionNote: '八田與一設計「烏山頭水庫（珊瑚潭）」與「嘉南大圳」；因水資源不足以全區種植水稻，採用科學的「三年輪作給水法」（水稻、甘蔗、雜糧三年一輪輪流供水），使嘉南平原躍居米倉。'
        }
      ],
      firstNodeId: 'node_hatta_irrigation_design'
    },
    yu_qingfang: {
      id: 'yu_qingfang',
      eraId: 'era_06_japanese_rule',
      name: '余清芳',
      title: '西來庵武裝抗日領袖',
      stance: 'rebel_leader',
      stanceBadge: '⛩️ 宗教武裝',
      avatar: '🗡️',
      missionGoal: '結合臺南西來庵王爺信仰與避彈神符，凝聚基層農民發動武裝抗日，引爆噍吧哖抗暴',
      customResourceName: '西來庵神符義民信仰力',
      initialStats: { resource: 170, reputation: 60, historicalInsight: 35 },
      startingClueId: 'clue_yu_xilaian_oath',
      exclusiveMinigameId: 'game_tapa_mountain_ambush',
      minigameName: '噍吧哖山區林野伏擊抗警',
      examPoints: [
        {
          id: 'exp_06_yu_01',
          topic: '族群抗爭',
          standardTerm: '西來庵事件（噍吧哖事件 / 1915）',
          frequentQuestionNote: '余清芳等人利用宗教信仰起事，為臺灣漢人「最後一次大規模武裝抗日」；此後臺灣抗日路線轉向合法、和平的「非武裝政治社會運動」。'
        }
      ],
      firstNodeId: 'node_yu_qingfang_battle'
    },
    mona_rudao: {
      id: 'mona_rudao',
      eraId: 'era_06_japanese_rule',
      name: '莫那・魯道',
      title: '賽德克族馬赫坡社大頭目',
      stance: 'indigenous_tribal',
      stanceBadge: '🏹 尊嚴血祭',
      avatar: '🏔️',
      missionGoal: '因不堪日本警察壓迫勞役與文化侮辱，率六社族人於霧社公學校起義，為族群尊嚴而戰',
      customResourceName: '賽德克祖靈尊嚴信條',
      initialStats: { resource: 200, reputation: 65, historicalInsight: 40 },
      startingClueId: 'clue_mona_wushe_pledge',
      exclusiveMinigameId: 'game_wushe_cliff_defense',
      minigameName: '馬赫坡高崖斷魂岩掩護阻擊',
      examPoints: [
        {
          id: 'exp_06_mona_01',
          topic: '族群抗爭',
          standardTerm: '霧社事件 (1930)',
          frequentQuestionNote: '賽德克族馬赫坡社頭目莫那・魯道因日警長期勞役壓迫與文化歧視發動起義；為日治時期臺灣原住民族「最後一次大規模武裝反抗事件」，促使總督府檢討理番政策。'
        }
      ],
      firstNodeId: 'node_mona_wushe_uprising'
    },
    lin_xiantang: {
      id: 'lin_xiantang',
      eraId: 'era_06_japanese_rule',
      name: '林獻堂',
      title: '霧峰林家士紳 · 臺灣議會請願之父',
      stance: 'cultural_pioneer',
      stanceBadge: '🏛️ 議會請願',
      avatar: '🎩',
      missionGoal: '發起連續15次向日本帝國議會遞交「臺灣議會設置請願書」，爭取臺灣人民主自治立法權',
      customResourceName: '全島仕紳簽名連署冊',
      initialStats: { resource: 380, reputation: 65, historicalInsight: 55 },
      startingClueId: 'clue_lin_petition_draft',
      exclusiveMinigameId: 'game_petition_signature_tour',
      minigameName: '全島仕紳大眾請願書巡迴連署',
      examPoints: [
        {
          id: 'exp_06_lin_01',
          topic: '政治制度',
          standardTerm: '臺灣議會設置請願運動 (1921-1934)',
          frequentQuestionNote: '林獻堂領導向日本帝國議會請願設立「臺灣民選議會」，歷時14年共15次，為日治時期歷時最久、規模最大的非武裝政治爭取運動。'
        }
      ],
      firstNodeId: 'node_lin_petition_movement'
    },
    chiang_weishui: {
      id: 'chiang_weishui',
      eraId: 'era_06_japanese_rule',
      name: '蔣渭水',
      title: '大安醫院院長 · 臺灣文化先鋒',
      stance: 'cultural_pioneer',
      stanceBadge: '📢 啟蒙導師',
      avatar: '🩺',
      missionGoal: '撰寫《臨床講義》診斷臺灣患「知識營養不良症」，創立臺灣文化協會，發行《臺灣民報》組民眾黨',
      customResourceName: '大安醫院民智覺醒點',
      initialStats: { resource: 220, reputation: 70, historicalInsight: 60 },
      startingClueId: 'clue_clinical_notes',
      exclusiveMinigameId: 'game_minpao_press_distribute',
      minigameName: '《臺灣民報》油墨印報與夜間讀報社發送',
      examPoints: [
        {
          id: 'exp_06_chiang_01',
          topic: '社會文教',
          standardTerm: '臺灣文化協會與《臺灣民報》',
          frequentQuestionNote: '1921年蔣渭水等人成立「臺灣文化協會」，發表《臨床講義》、設立讀報社、舉辦巡迴演講；創辦《臺灣民報》（被譽為「臺灣人唯一言論機關」）；1927年成立臺灣首個合法政黨「臺灣民眾黨」。'
        }
      ],
      firstNodeId: 'node_chiang_cultural_association'
    },
    kobayashi_seizo: {
      id: 'kobayashi_seizo',
      eraId: 'era_06_japanese_rule',
      name: '小林躋造',
      title: '大日本帝國海軍大將 · 臺灣總督',
      stance: 'ruler_official',
      stanceBadge: '⛩️ 皇民化總督',
      avatar: '🎖️',
      missionGoal: '戰時體制下推行「皇民化、工業化、南進基地化」三大政策，強制推廣國語家庭與改日本姓名',
      customResourceName: '皇民化配給物資統制點',
      initialStats: { resource: 400, reputation: 30, historicalInsight: 45 },
      startingClueId: 'clue_kominka_decree',
      exclusiveMinigameId: 'game_shinto_shrine_census',
      minigameName: '神社參拜合規率與改姓名審核',
      examPoints: [
        {
          id: 'exp_06_kobayashi_01',
          topic: '政治制度',
          standardTerm: '皇民化運動（皇民化、工業化、南進基地化）',
          frequentQuestionNote: '中日戰爭爆發後總督小林躋造推行「皇民化運動」：禁止漢文報刊、強制說日語（國語家庭享特權）、改日本姓名、參拜神社、配合南進政策推動軍需工業化，徵調臺人充當軍伕志願兵。'
        }
      ],
      firstNodeId: 'node_kobayashi_kominka_drive'
    },

    // ------------------------- 篇章 7：戰後臺灣（戒嚴、民主化與經濟奇蹟） -------------------------
    chen_yi: {
      id: 'chen_yi',
      eraId: 'era_07_postwar_modern',
      name: '陳儀',
      title: '臺灣省行政長官公署行政長官兼警備總司令',
      stance: 'ruler_official',
      stanceBadge: '🏛️ 戰後接收',
      avatar: '🎖️',
      missionGoal: '接收日產實施全島物資專賣管制，因軍紀不良與惡性通膨引發大查緝與二二八悲劇',
      customResourceName: '行政長官公署專賣物資收益',
      initialStats: { resource: 350, reputation: 20, historicalInsight: 45 },
      startingClueId: 'clue_monopoly_bureau_order',
      exclusiveMinigameId: 'game_contraband_tobacco_raid',
      minigameName: '大稻埕天馬茶房私煙查緝處置',
      examPoints: [
        {
          id: 'exp_07_chen_01',
          topic: '政治制度',
          standardTerm: '行政長官公署與二二八事件 (1947)',
          frequentQuestionNote: '戰後國民政府設「臺灣省行政長官公署」集行政、立法、司法、軍事大權於長官一身；因經濟專賣失靈、官員貪腐、軍紀敗壞、惡性通膨，1947年2月27日查緝私煙引發流血衝突，引爆全臺二二八事件。'
        }
      ],
      firstNodeId: 'node_chen_yi_crisis_handling'
    },
    chen_cheng: {
      id: 'chen_cheng',
      eraId: 'era_07_postwar_modern',
      name: '陳誠',
      title: '行政院院長 · 臺灣省主席',
      stance: 'ruler_official',
      stanceBadge: '🌾 土地改革',
      avatar: '🌾',
      missionGoal: '推行和平土地改革（三七五減租、公地放領、耕者有其田），實施四萬換一元發行新臺幣穩定金融',
      customResourceName: '自耕農土地登記權狀',
      initialStats: { resource: 380, reputation: 55, historicalInsight: 50 },
      startingClueId: 'clue_land_reform_acts',
      exclusiveMinigameId: 'game_new_taiwan_dollar_exchange',
      minigameName: '舊臺幣四萬換一塊新臺幣點鈔發行',
      examPoints: [
        {
          id: 'exp_07_cheng_01',
          topic: '水利農業',
          standardTerm: '土地改革三部曲（三七五減租、公地放領、耕者有其田）',
          frequentQuestionNote: '陳誠主持土地改革三部曲：①三七五減租（限制地租最高37.5%）、②公地放領（出售國有公地給農民）、③耕者有其田（徵收地主超額土地轉賣佃農），促使佃農轉為自耕農，奠定農業轉向工業的基礎。'
        },
        {
          id: 'exp_07_cheng_02',
          topic: '對外貿易',
          standardTerm: '幣制改革（四萬換一塊新臺幣）',
          frequentQuestionNote: '1949年為遏止大陸內戰波及的惡性通貨膨脹，推行幣制改革，規定以「舊臺幣四萬元折換新臺幣一元」，穩定戰後臺灣金融。'
        }
      ],
      firstNodeId: 'node_chen_cheng_land_reform'
    },
    sun_yunsuan_li: {
      id: 'sun_yunsuan_li',
      eraId: 'era_07_postwar_modern',
      name: '孫運璿 / 李國鼎',
      title: '經濟舵手 · 科技之父',
      stance: 'ruler_official',
      stanceBadge: '💡 科技矽島',
      avatar: '💻',
      missionGoal: '推動十大建設基礎工程，創立工研院引進半導體晶圓技術，打造新竹科學園區奠基科技矽島',
      customResourceName: '高科技積體電路研發經費',
      initialStats: { resource: 400, reputation: 65, historicalInsight: 60 },
      startingClueId: 'clue_hsinchu_science_park_plan',
      exclusiveMinigameId: 'game_silicon_wafer_lithography',
      minigameName: '工研院微米晶圓積體電路微影校準',
      examPoints: [
        {
          id: 'exp_07_sun_01',
          topic: '對外貿易',
          standardTerm: '十大建設與新竹科學工業園區',
          frequentQuestionNote: '面對石油危機與外交困境，推行十大建設（中鋼、中船、中山高、核電廠等）；孫運璿與李國鼎成立「工研院」，並於1980年創設「新竹科學工業園區」，推動臺灣由傳統加工出口區成功轉型為高科技半導體王國。'
        }
      ],
      firstNodeId: 'node_sun_hsinchu_park_setup'
    },
    lei_zhen: {
      id: 'lei_zhen',
      eraId: 'era_07_postwar_modern',
      name: '雷震',
      title: '《自由中國》發行人 · 民主鬥士',
      stance: 'cultural_pioneer',
      stanceBadge: '📰 自由民主',
      avatar: '🖋️',
      missionGoal: '以《自由中國》針砭時弊批判威權，串聯本省外省士紳籌組「中國民主黨」，引發雷震案入獄十載',
      customResourceName: '《自由中國》政論印刊份數',
      initialStats: { resource: 180, reputation: 65, historicalInsight: 60 },
      startingClueId: 'clue_free_china_magazine',
      exclusiveMinigameId: 'game_democracy_party_manifesto',
      minigameName: '中國民主黨創黨宣言審閱排印',
      examPoints: [
        {
          id: 'exp_07_lei_01',
          topic: '政治制度',
          standardTerm: '《自由中國》與雷震案 (1960)',
          frequentQuestionNote: '雷震創辦《自由中國》雜誌倡導言論自由與憲政民主，反對蔣中正違憲三度連任總統，並與高玉樹、李萬居等本土士紳籌組反對黨「中國民主黨」，最終遭當局以涉嫌叛亂羅織罪名逮捕入獄（雷震案）。'
        }
      ],
      firstNodeId: 'node_lei_zhen_free_press'
    },
    chiang_chingkuo: {
      id: 'chiang_chingkuo',
      eraId: 'era_07_postwar_modern',
      name: '蔣經國',
      title: '中華民國總統',
      stance: 'ruler_official',
      stanceBadge: '🏛️ 解嚴開放',
      avatar: '🇹🇼',
      missionGoal: '推動重大基礎工程「十大建設」，晚年順應民主思潮宣告解除戒嚴、開放報禁黨禁與赴陸探親',
      customResourceName: '國家自強建設政績點',
      initialStats: { resource: 420, reputation: 60, historicalInsight: 55 },
      startingClueId: 'clue_lifting_martial_law',
      exclusiveMinigameId: 'game_ten_major_projects_map',
      minigameName: '十大建設港灣高鐵藍圖規劃',
      examPoints: [
        {
          id: 'exp_07_cck_01',
          topic: '政治制度',
          standardTerm: '解除戒嚴 (1987) 與開放黨禁報禁',
          frequentQuestionNote: '臺灣自1949年實施長達38年之戒嚴令；蔣經國總統於1987年7月15日正式宣告「解除戒嚴」，隨後開放黨禁、報禁，並開放臺灣民眾赴大陸探親，開啟臺灣邁向自由民主社會的大門。'
        }
      ],
      firstNodeId: 'node_cck_martial_law_lift'
    },
    lee_tenghui: {
      id: 'lee_tenghui',
      eraId: 'era_07_postwar_modern',
      name: '李登輝',
      title: '首位公民直選總統 · 民主先生',
      stance: 'ruler_official',
      stanceBadge: '🗳️ 憲政改革',
      avatar: '🗳️',
      missionGoal: '宣布終止動員戡亂時期，推動資深中央民代退職國會全面改選，完成憲政修憲落實總統公民直選',
      customResourceName: '國會憲政修憲協商力',
      initialStats: { resource: 410, reputation: 65, historicalInsight: 60 },
      startingClueId: 'clue_constitutional_reform',
      exclusiveMinigameId: 'game_direct_presidential_ballot',
      minigameName: '首任第九任總統公民直選計票',
      examPoints: [
        {
          id: 'exp_07_lee_01',
          topic: '政治制度',
          standardTerm: '終止動員戡亂、國會全面改選與公民直選總統 (1996)',
          frequentQuestionNote: '李登輝總統於1991年宣告「終止動員戡亂時期」，廢除《動員戡亂時期臨時條款》；解決萬年國會問題落實中央民意代表全面改選；並於1996年舉辦臺灣歷史上首次「總統公民直接選舉」，確立臺灣主權在民憲政體制。'
        }
      ],
      firstNodeId: 'node_lee_direct_democracy'
    }
  };

  // ==========================================================================
  // 三、 標竿示範篇章：第 5 章（劉銘傳 vs 陶德）與 第 6 章（蔣渭水 vs 八田與一）
  //      完整事件分支節點資料庫 (Demonstration EVENT_NODES)
  // ==========================================================================
  const CURRICULUM_EVENT_NODES = {
    // ------------------------------------------------------------------------
    // 第 5 章 示範人物 1：首任巡撫 劉銘傳 (liu_mingchuan)
    // ------------------------------------------------------------------------
    node_liu_railway_decision: {
      id: 'node_liu_railway_decision',
      eraId: 'era_05_late_qing',
      characterId: 'liu_mingchuan',
      title: '臺灣省自強新政之爭：蒸汽鐵路該不該開工修築？',
      description: '朝廷撥款建省經費拮据，守舊幕僚建議維持舊有綠營巡邏防汛土堡即可；劉銘傳力主引進近代蒸汽鐵路，打破南北阻隔！',
      historicalContext: '中法戰爭（1884-1885）後清廷體認臺灣為東南海防門戶，正式宣佈臺灣建省；劉銘傳出任首任巡撫，大刀闊斧推動自強新政。',
      targetLocationId: 'loc_customs', // 評議/官署廳堂
      options: [
        {
          id: 'opt_liu_build_railway',
          targetLocationId: 'loc_customs',
          actionText: '【拍板興築鐵路】開鑿獅球嶺隧道，鋪設基隆至新竹蒸汽鐵路！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_liu_railway_blueprint',
          isHistorical: true,
          baseCost: 120,
          baseReward: 480,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '「騰雲號」火車鳴笛出發！基隆至新竹鐵路順利通車，臺灣誕生了全中國第一條由官方自主營運的近代客運鐵路，臺北商貿百業興隆！',
            historicalFactSummary: '【史實演進】劉銘傳在臺推動新政，興築基隆至新竹段鐵路、設新式郵政局發行郵票、架設電報線，奠定臺灣近代交通通訊重要雛形。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：劉銘傳時期鐵路僅修築「基隆至新竹」，其後邵友濂因財政壓力停止往南興建；臺灣縱貫鐵路全通要到日治時期（1908年）。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_liu_cancel_railway',
          targetLocationId: 'loc_tea_firm',
          actionText: '【收回成命節省洋務銀】僅擴建各縣舊式土壘防汛土堡，放棄蒸汽鐵路。',
          badge: '🛡️ 守舊 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 120,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '放棄鐵路雖然節省了初期撥款，但遇到山洪暴雨，各府縣公文與茶商貨運經常被沖毀失聯數週，自強新政陷入守舊泥淖……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏現代鐵路動脈，大稻埕茶葉無法迅速送抵基隆深水良港裝船，臺灣現代化轉型大幅落後，日後開港紅利严重萎縮。'
          },
          examReviewNote: '段考警示：清領後期臺灣治理方針已由早期的「消極防守封山」轉為「積極開山自強」，劉銘傳為最指標性改革巡撫。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 5 章 示範人物 2：寶順洋行經理 陶德 (john_dodd)
    // ------------------------------------------------------------------------
    node_dodd_tea_export: {
      id: 'node_dodd_tea_export',
      eraId: 'era_05_late_qing',
      characterId: 'john_dodd',
      title: '粗製毛茶運抵歐美受潮變酸，洋行該如何打破茶業瓶頸？',
      description: '臺灣氣候極適合植茶，但茶農僅能日曬粗茶，航行千里往往變質；英商陶德面臨開拓歐美烏龍茶品牌的關鍵抉擇！',
      historicalContext: '1860年代臺灣因英法聯軍條約開港四口，外國洋行雲集淡水與大稻埕，茶葉迅速躍居第一大出口物資。',
      targetLocationId: 'loc_tea_firm', // 洋行商館
      options: [
        {
          id: 'opt_dodd_invest_tea',
          targetLocationId: 'loc_tea_firm',
          actionText: '【引進安溪焙茶師與融資茶農】與李春生合作，精焙 Formosa Oolong 直銷紐約！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_dodd_tea_contract',
          isHistorical: true,
          baseCost: 100,
          baseReward: 460,
          criticalChance: 0.7,
          criticalMultiplier: 2.2,
          consequence: {
            narrative: '精焙烏龍茶香氣四溢！「Formosa Oolong Tea」在紐約引起搶購狂潮，大稻埕因此躍居全島最繁榮的商業首善之區！',
            historicalFactSummary: '【史實演進】陶德與買辦李春生合作，開拓臺灣茶葉直接外銷歐美，打破過去仰賴大陸廈門轉運體系，使臺灣貿易長年維持「出超」，經濟重心北移。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：清領後期臺灣三大出口品為「茶、糖、樟腦」；茶葉產於北部山丘，造就大稻埕繁榮並促成「經濟重心由南向北轉移」。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_dodd_raw_tea_dump',
          targetLocationId: 'loc_smuggler',
          actionText: '【低價賤賣未烘乾毛茶】不投入精焙成本，將潮濕粗茶就地廉價傾銷。',
          badge: '🏮 短視 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 100,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '粗茶抵達海外全數受潮變味，外國買家紛紛退貨要求賠償，寶順洋行商譽受損，面臨倒閉破產危機……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣未打響精緻烏龍茶國際品牌，大稻埕錯失開港茶金奇蹟，洋行紛紛撤資返回香港。'
          },
          examReviewNote: '段考警示：開港通商後臺灣茶葉之所以能享譽全球，在於引進了精細烘焙工藝與外銷直接貿易網絡。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 6 章 示範人物 3：文化先鋒 蔣渭水 (chiang_weishui)
    // ------------------------------------------------------------------------
    node_chiang_cultural_association: {
      id: 'node_chiang_cultural_association',
      eraId: 'era_06_japanese_rule',
      characterId: 'chiang_weishui',
      title: '特高警察嚴密臨檢監視，如何醫治臺灣同胞的「知識營養不良症」？',
      description: '大正民主浪潮下，青年醫師蔣渭水開出臺灣首張《臨床講義》，面對殖民警察高壓，該採取何種啟蒙路線喚醒民眾？',
      historicalContext: '1920年代在世界民族自決思潮影響下，臺灣知識分子由流血武裝抗日轉向以「非武裝政治社會運動」爭取自主權利。',
      targetLocationId: 'loc_tea_firm', // 文協港町講堂
      options: [
        {
          id: 'opt_chiang_legal_enlightenment',
          targetLocationId: 'loc_tea_firm',
          actionText: '【創立臺灣文化協會與《臺灣民報》】以合法演講、讀報社與話劇啟發大眾民智！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_clinical_notes',
          isHistorical: true,
          baseCost: 80,
          baseReward: 420,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '「同胞須團結，團結真有力！」《臺灣民報》傳遍街頭巷尾，全島文化巡迴演講場場爆滿，民主自決種子深植人心！',
            historicalFactSummary: '【史實演進】1921年成立的「臺灣文化協會」與《臺灣民報》（被譽為臺灣人唯一言論機關），成為近代臺灣民族自覺與民主公民啟蒙的最重要里程碑。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：蔣渭水發表《臨床講義》診斷臺灣患「知識營養不良症」；創辦文協、臺灣民報，並於1927年成立全臺首個合法政黨「臺灣民眾黨」。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_chiang_underground_violence',
          targetLocationId: 'loc_smuggler',
          actionText: '【重啟地下極端暴力抗爭】秘密購置炸藥武器，企圖發動街頭流血武裝突襲。',
          badge: '⚔️ 暴動 If 路線',
          isHistorical: false,
          baseCost: 90,
          baseReward: 70,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '總督府以「違反治安維持法」調遣重裝軍警大搜捕，知識青年紛紛罹難入獄，萌芽的文化讀報組織慘遭全面取締消滅……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣失去和平啟蒙與民主思潮洗禮，日治中期的議會請願、農民組合與工友總聯盟等社會運動徹底夭折。'
          },
          examReviewNote: '段考警示：1915年西來庵事件後，臺灣知識分子認清現代國家武器懸殊，確立改採「合法體制內非武裝抗爭」為正確方向。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 6 章 示範人物 4：水利總工程師 八田與一 (yoichi_hatta)
    // ------------------------------------------------------------------------
    node_hatta_irrigation_design: {
      id: 'node_hatta_irrigation_design',
      eraId: 'era_06_japanese_rule',
      characterId: 'yoichi_hatta',
      title: '十萬甲嘉南平原看天田水荒嚴重，工程師該如何規劃水利？',
      description: '嘉南平原過去乾季乾裂、雨季氾濫，有限的水源無法全面供給十萬甲農田種植水稻，八田技師該如何裁定水利制度？',
      historicalContext: '第一次世界大戰後日本內地米價高漲，殖民政府推動「農業臺灣、工業日本」政策，亟需擴大臺灣稻米外銷日本產量。',
      targetLocationId: 'loc_customs', // 總督府官廳 / 嘉南水利署
      options: [
        {
          id: 'opt_hatta_three_year_rotation',
          targetLocationId: 'loc_customs',
          actionText: '【興建烏山頭水庫＋實施三年輪作給水法】分區輪流給水種植水稻、甘蔗與雜糧！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_wusanto_blueprint',
          isHistorical: true,
          baseCost: 110,
          baseReward: 450,
          criticalChance: 0.65,
          criticalMultiplier: 1.8,
          consequence: {
            narrative: '大圳水閘滔滔奔流！「三年輪作給水法」使水源發揮極限效益，十萬甲不毛之地一躍成為臺灣最豐饒的米糖大穀倉！',
            historicalFactSummary: '【史實演進】八田與一歷時10年建成當時亞洲最大半水力填築水庫「烏山頭水庫」與「嘉南大圳」，成功打破「看天田」水荒困境。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：八田與一建造「烏山頭水庫（珊瑚潭）」與「嘉南大圳」，因水量不足採用「三年輪作給水法」（三年輪種一次水稻、甘蔗、雜糧）。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_hatta_uncontrolled_water',
          targetLocationId: 'loc_tea_firm',
          actionText: '【不設輪作給水限制，任由上游農民搶水種稻】不顧配額隨意放水。',
          badge: '🌊 失序 If 路線',
          isHistorical: false,
          baseCost: 80,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '上游農民過度浪費搶水，下游數萬甲農田乾涸龜裂禾苗枯死，水庫半年內蓄水耗盡，引發各地激烈械鬥……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏科學輪作配水制度，大圳耗資數千萬圓卻未能提高產量，嘉南平原農業現代化轉型宣告失敗。'
          },
          examReviewNote: '段考警示：三年輪作給水法是因應臺灣降雨集中夏季、南部冬季乾旱特性的卓越工程制度設計，為高頻考題。',
          nextNodeId: 'node_settlement'
        }
      ]
    },
    // ------------------------------------------------------------------------
    // 第 1 章 角色 1：卑南玉工長老 (peinan_artisan)
    // ------------------------------------------------------------------------
    node_peinan_craft_trade: {
      id: 'node_peinan_craft_trade',
      eraId: 'era_01_prehistory',
      characterId: 'peinan_artisan',
      title: '卑南玉工長老：如何打磨珍貴臺灣玉玦並開拓海外交換航路？',
      description: '花蓮豐田閃玉玉胚送抵卑南聚落，長老面臨琢磨工藝傳承與海外以玉換物的重要抉擇！',
      historicalContext: '新石器時代卑南文化以大量精緻玉器（玉耳飾、玉玦、玉管）與石板棺聞名，且跨越巴士海峽廣泛流通於東南亞各島嶼。',
      targetLocationId: 'loc_sugar_guild', // 玉石工坊
      options: [
        {
          id: 'opt_peinan_craft_jade',
          targetLocationId: 'loc_sugar_guild',
          actionText: '【砂繩細磨臺灣玉玦】以竹管與石英砂慢工精琢，開創南島航海玉器交換圈！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_peinan_jade',
          isHistorical: true,
          baseCost: 80,
          baseReward: 380,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '玉玦溫潤剔透！卑南玉器不僅在島內各聚落備受尊崇，更隨南島語族航海交換網名揚海外！',
            historicalFactSummary: '【史實演進】新石器時代卑南文化出土大量精美玉飾、石板棺與巨石遺跡，東南亞多處遺址亦發現產自臺灣之閃玉。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：卑南文化為新石器時代晚期代表，以「石板棺（仰身直肢葬）」與精緻「臺灣閃玉玦」為考題核心特徵。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_peinan_crude_stone',
          targetLocationId: 'loc_dock',
          actionText: '【粗製濫造隨意敲擊】放棄細磨技術，僅製作粗糙敲擊石片。',
          badge: '🪨 粗糙 If 路線',
          isHistorical: false,
          baseCost: 50,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '粗劣的石片無人願意交換，卑南聚落錯失與外洋南島族群建立貿易網絡的契機……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏精湛磨玉工藝，臺灣史前文化與東南亞的交流中斷，海外影響力大幅退步。'
          },
          examReviewNote: '段考警示：舊石器（長濱）用「打製石器」，新石器時代則以「磨製石器」與陶器為劃時代特徵。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 1 章 角色 2：十三行鐵匠 (shisanhang_smith)
    // ------------------------------------------------------------------------
    node_shisanhang_metallurgy: {
      id: 'node_shisanhang_metallurgy',
      eraId: 'era_01_prehistory',
      characterId: 'shisanhang_smith',
      title: '十三行鐵匠：如何操控風箱高溫煉鐵並與外洋商船互市？',
      description: '淡水河口海風呼嘯，高溫煉鐵爐即將開爐，海外商船帶來珍貴的玻璃珠與銅錢！',
      historicalContext: '金屬器時代十三行文化擁有高溫煉鐵技術，遺址出土煉鐵爐殘渣、側身屈肢葬，以及大量外洋瑪瑙玻璃珠與唐宋銅錢。',
      targetLocationId: 'loc_smuggler', // 十三行高溫煉鐵工棚
      options: [
        {
          id: 'opt_shisanhang_smelt',
          targetLocationId: 'loc_smuggler',
          actionText: '【鼓動風箱煉熟鐵】鍛造鐵質箭鏃與農具，與南洋商船以鐵器交換玻璃珠！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_shisanhang_bellows',
          isHistorical: true,
          baseCost: 90,
          baseReward: 400,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '高爐烈焰騰空！鍛造出的精良鐵器換來了璀璨的南洋玻璃珠與唐宋開元通寶，十三行成為繁榮的海口港聚落！',
            historicalFactSummary: '【史實演進】新北八里十三行文化掌握煉鐵技術，開啟金屬器時代，出土唐宋錢幣證明臺灣海外商貿歷史悠久。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：十三行文化為「金屬器時代」代表，必考煉鐵技術、側身屈肢葬，以及外來交換之玻璃珠與唐宋銅錢。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_shisanhang_extinguish',
          targetLocationId: 'loc_dock',
          actionText: '【熄滅高爐放棄煉鐵】停止鍛造，僅靠海濱採集貝類生活。',
          badge: '🐚 停滯 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '失去高溫冶鐵技術，聚落生產力陷入停滯，外洋商舶不再靠港交易……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣金屬器時代延後，原住民無法以鐵製器械改良農墾，技術落後數百年。'
          },
          examReviewNote: '段考警示：金屬工具的出現大幅提升農業與狩獵效率，促成史前聚落規模顯著擴大。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 1 章 角色 3：阿美族部落長老 (amis_elder)
    // ------------------------------------------------------------------------
    node_amis_matriarchy_order: {
      id: 'node_amis_matriarchy_order',
      eraId: 'era_01_prehistory',
      characterId: 'amis_elder',
      title: '阿美族部落長老：如何協調母系親族並指揮年齡階級青年防衛海疆？',
      description: '豐年祭盛典臨近，長老需凝聚母系家長會議，並督導年齡階級男子青年巡護海防！',
      historicalContext: '阿美族為典型母系社會，財產由女性繼承、男子從妻居；而公共事務與部落防禦則由男子嚴密的「年齡階級」體系承擔。',
      targetLocationId: 'loc_customs', // 部落聚會所
      options: [
        {
          id: 'opt_amis_age_rank_defense',
          targetLocationId: 'loc_customs',
          actionText: '【啟動青年年齡階級巡防】母系長老統籌祭儀穀糧，年齡階級青年勇衛部落！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_amis_age_rank',
          isHistorical: true,
          baseCost: 70,
          baseReward: 360,
          criticalChance: 0.65,
          criticalMultiplier: 1.8,
          consequence: {
            narrative: '青年隊伍步伐齊整、鼓聲雷動！母系長老滿意主持大祭，部落長治久安，代代相傳！',
            historicalFactSummary: '【史實演進】臺灣原住民族社會組織多樣：阿美族為母系社會與男子年齡階級；泰雅族為父系祖靈規範（gaga）；排灣族與魯凱族為貴族階級社會。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：原住民族社會結構對照（母系社會＝阿美族、平埔西拉雅族；父系社會＝布農族、泰雅族、賽夏族；貴族社會＝排灣族、魯凱族）。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_amis_disorganize',
          targetLocationId: 'loc_dock',
          actionText: '【廢除年齡階級訓練】放任青年各自散漫，不設巡守組織。',
          badge: '🍂 渙散 If 路線',
          isHistorical: false,
          baseCost: 50,
          baseReward: 70,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '部落缺乏組織與戒備，遭遇風暴海患時手足無措，各氏族矛盾叢生……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】失去嚴密的年齡階級傳承，部落抵禦外侮與文化傳承機制面臨瓦解。'
          },
          examReviewNote: '段考警示：年齡階級男子集會所是阿美族青年接受軍事、文化教育與承擔部落公共服務的核心組織。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 2 章 角色 2：荷蘭末代長官 揆一 (coyett)
    // ------------------------------------------------------------------------
    node_coyett_siege_governance: {
      id: 'node_coyett_siege_governance',
      eraId: 'era_02_international',
      characterId: 'coyett',
      title: '荷蘭長官揆一：鄭成功水師逼近大員，如何審定關稅並鞏固要塞？',
      description: '大員港口千帆林立，荷蘭東印度公司末代長官揆一面臨轉口貿易財政與要塞防禦的重大抉擇！',
      historicalContext: '荷蘭在臺建立熱蘭遮城與普羅民遮城，壟斷轉口貿易與鹿皮、砂糖外銷，揆一在鄭軍圍城九個月後簽署締和條約離開臺灣。',
      targetLocationId: 'loc_customs', // 評議公署
      options: [
        {
          id: 'opt_coyett_fortify_and_tax',
          targetLocationId: 'loc_customs',
          actionText: '【鞏固熱蘭遮要塞＋整飭海港關稅】嚴查走私逃稅，修葺城堡砲台防線！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_voc_tariff',
          isHistorical: true,
          baseCost: 120,
          baseReward: 480,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '城堡火砲齊備，港口商船依法繳納稅餉，揆一堅守要塞達九個月之久，留下荷治大員詳實行政史料！',
            historicalFactSummary: '【史實演進】荷蘭東印度公司以臺灣為東亞轉口貿易樞紐（中國絲綢、日本銀、臺灣鹿皮與砂糖），揆一著有《被遺誤的臺灣》記載這段歷史。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：荷蘭統治核心在「大員（今臺南安平）」，建熱蘭遮城（王城）與普羅民遮城（赤崁樓），徵收人頭稅引發郭懷一事件。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_coyett_abandon',
          targetLocationId: 'loc_smuggler',
          actionText: '【挪用公帑私吞走私款】不修砲台，任由城堡防務廢弛。',
          badge: '⚠️ 瀆職 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 100,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '防務崩潰，城堡彈藥庫受潮失效，巴達維亞總督府震怒將其免職押解回國……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】東印度公司東亞航線提前瓦解，荷治時代在混亂中草草收場。'
          },
          examReviewNote: '段考警示：荷蘭統治臺灣以經濟掠奪與轉口貿易為導向，苛稅與人頭稅是引發多次反抗的主因。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 2 章 角色 3：抗稅領袖 郭懷一 (guo_huaiyi)
    // ------------------------------------------------------------------------
    node_guo_huaiyi_strike: {
      id: 'node_guo_huaiyi_strike',
      eraId: 'era_02_international',
      characterId: 'guo_huaiyi',
      title: '抗稅墾首郭懷一：荷蘭苛徵人頭稅逼迫民不聊生，如何號召漢人起事？',
      description: '赤崁漢人墾民遭逢荷蘭政務官加徵人頭稅盤剝，墾首郭懷一決定為移墾同胞討回公道！',
      historicalContext: '1652年赤崁漢人移民因不滿荷蘭人頭稅與苛暴統治，在郭懷一率領下發動大規模武裝起義，攻打普羅民遮城。',
      targetLocationId: 'loc_sugar_guild', // 赤崁市集集結
      options: [
        {
          id: 'opt_guo_strike_oppression',
          targetLocationId: 'loc_sugar_guild',
          actionText: '【號召墾民揭竿起事】攻打普羅民遮城，抗擊荷蘭殖民者人頭苛稅！',
          badge: '👑 史實決策 (推薦)',
          actionIcon: '⚔️',
          buttonText: '反抗荷蘭人',
          requiredClueId: 'clue_voc_poll_tax',
          isHistorical: true,
          baseCost: 80,
          baseReward: 420,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '「驅逐紅毛苛稅！」數千移墾漢民奮勇響應，沉重打擊了荷蘭東印度公司的殖民威權！',
            historicalFactSummary: '【史實演進】1652年「郭懷一事件」促使荷蘭人意識到漢人移墾威脅，隨後修築普羅民遮城（赤崁樓前身）以加強監控漢民。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：郭懷一事件導火線為荷蘭人苛徵「人頭稅」；事件平定後荷人增築「普羅民遮城（赤崁樓）」防備漢人。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_guo_submit',
          targetLocationId: 'loc_smuggler',
          actionText: '【屈膝順從任由加稅】逼迫墾民賣身繳稅，甘受盤剝。',
          badge: '⛓️ 屈從 If 路線',
          actionIcon: '⛓️',
          buttonText: '屈從加稅',
          isHistorical: false,
          baseCost: 60,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '苛稅越演越烈，大量墾民破產逃亡，赤崁農業開墾陷入長久荒蕪……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】漢人移墾勢力衰亡，大員農業墾殖停擺，鄭成功入臺時失去漢民內應支援。'
          },
          examReviewNote: '段考警示：荷治後期移墾漢人已達數萬人，漢民反苛稅鬥爭為鄭成功攻臺奠定了強大民意基礎。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 3 章 角色 1：諮議參軍 陳永華 (chen_yonghua)
    // ------------------------------------------------------------------------
    node_chen_education_salt: {
      id: 'node_chen_education_salt',
      eraId: 'era_03_zheng_regime',
      characterId: 'chen_yonghua',
      title: '諮議參軍陳永華：面對清廷遷界封鎖，如何奠定文教與經濟基業？',
      description: '鄭軍退守臺灣面臨糧餉與文教匱乏，陳永華提出寓兵於農軍屯、建孔廟與推廣曬鹽之劃時代大策！',
      historicalContext: '陳永華輔佐鄭氏父子，建臺南孔廟「全臺首學」、設科舉開官辦學校、改革軍屯（寓兵於農）並推廣「淋鹵曬鹽法」。',
      targetLocationId: 'loc_customs', // 全臺首學參軍府
      options: [
        {
          id: 'opt_chen_build_school_salt',
          targetLocationId: 'loc_customs',
          actionText: '【建臺南孔廟創科舉＋推淋鹵曬鹽與軍屯】寓兵於農自給自足，奠定漢文化全臺首學！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_chen_confucian_temple',
          isHistorical: true,
          baseCost: 100,
          baseReward: 460,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '臺南孔廟「全臺首學」書聲琅琅！洲南場白鹽堆疊如山，軍屯農民豐衣足食，臺灣文教自此蓬勃！',
            historicalFactSummary: '【史實演進】陳永華被譽為「鄭氏諸葛」，建臺南孔廟確立儒學文教，改煮鹽為曬鹽改善民生，並設立軍屯解決軍糧問題。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：陳永華三大貢獻——建臺南孔廟「全臺首學」、設科舉育才、推行「淋鹵曬鹽法」改善食鹽品質。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_chen_militarism_only',
          targetLocationId: 'loc_smuggler',
          actionText: '【只重掠奪不辦文教】拒絕興辦學校與實業，強徵民田作為軍糧。',
          badge: '⚔️ 窮兵 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '民間怨聲載道，文士無處施展抱負紛紛求去，東寧政權根基迅速動搖……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏文教與民生實業，鄭氏治臺僅能維持軍事割據，漢人文明深耕受阻數十年。'
          },
          examReviewNote: '段考警示：鄭氏政權得以立足臺灣20餘年，關鍵在於推行寓兵於農軍屯與文教制度，使其具備完備政權架構。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 3 章 角色 2：東寧之主 鄭經 (zheng_jing)
    // ------------------------------------------------------------------------
    node_zheng_jing_foreign_trade: {
      id: 'node_zheng_jing_foreign_trade',
      eraId: 'era_03_zheng_regime',
      characterId: 'zheng_jing',
      title: '延平王鄭經：清廷實施遷界令嚴密封鎖，如何經略海外走私商網？',
      description: '大陸沿海被清廷堅壁清野遷界，鄭經需開拓與英國東印度公司及日本通商，籌措軍火對抗三藩之局！',
      historicalContext: '鄭經改天興、萬年二縣為二州，與英國東印度公司簽訂通商條約，積極開展對日、南洋走私貿易，並跨海出兵參與三藩之亂。',
      targetLocationId: 'loc_tea_firm', // 英商商館
      options: [
        {
          id: 'opt_zheng_jing_eic_treaty',
          targetLocationId: 'loc_tea_firm',
          actionText: '【與英國東印度公司簽訂通商合約】准許英商在臺設立商館，採購火藥軍械！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_zheng_eic_treaty',
          isHistorical: true,
          baseCost: 110,
          baseReward: 480,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '英商船舶進駐安平！火藥槍砲源源不絕送抵軍港，東寧海上商貿網絡突破清廷封鎖，名震南洋！',
            historicalFactSummary: '【史實演進】1670年鄭經與英國東印度公司簽約通商，為臺灣歷史上首次由本土政權簽署的正式對外商務條約。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：鄭經行政區劃改二縣為「天興州、萬年州」，設澎湖安撫司；對外與英商簽訂通商合約，出兵三藩之亂。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_zheng_jing_isolation',
          targetLocationId: 'loc_smuggler',
          actionText: '【閉關鎖國拒絕外商】拒絕洋商貿易，銷毀走私帆船。',
          badge: '🚫 封閉 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 70,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '軍餉斷絕、火器無從補充，面對清廷大軍壓境毫無還手之力……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】失去外貿利潤與火器供應，東寧艦隊早於澎湖之戰前便因物資枯竭瓦解。'
          },
          examReviewNote: '段考警示：鄭氏時期對外貿易延續荷蘭以來的轉口特色，鹿皮、砂糖外銷日本換取銅與銀兩，為軍費主要支柱。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 3 章 角色 3：水師提督 施琅 (shi_lang)
    // ------------------------------------------------------------------------
    node_shi_lang_memorial_decision: {
      id: 'node_shi_lang_memorial_decision',
      eraId: 'era_03_zheng_regime',
      characterId: 'shi_lang',
      title: '水師提督施琅：澎湖決戰大捷後朝廷欲棄臺灣，該如何上書？',
      description: '澎湖海戰大破劉國軒，清廷內部多數大臣力主「空其地、遷其民」，施琅必須說服康熙皇帝守衛臺灣！',
      historicalContext: '施琅攻克澎湖後鄭克塽降清，清廷爆發「臺灣棄留之爭」，施琅力陳《臺灣棄留疏》，終促成清廷設一府三縣納入版圖。',
      targetLocationId: 'loc_customs', // 提督水師公署
      options: [
        {
          id: 'opt_shi_memorial_keep_taiwan',
          targetLocationId: 'loc_customs',
          actionText: '【上呈《臺灣棄留疏》力陳海防門戶】力爭臺灣不可棄，促成設一府三縣納入版圖！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_shi_memorial_draft',
          isHistorical: true,
          baseCost: 100,
          baseReward: 450,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '康熙皇帝親批「留臺灣」！清廷設臺灣府隸屬福建省，下轄臺灣、鳳山、諸羅三縣，正式納入版圖！',
            historicalFactSummary: '【史實演進】施琅《臺灣棄留疏》力陳「棄之必釀大患，留之可衛東南」，1684年清廷設「一府三縣」，臺灣正式納入大清疆域。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：施琅《臺灣棄留疏》促成清廷「一府三縣（臺灣府；臺灣縣、鳳山縣、諸羅縣）」之設置，隸屬福建省。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_shi_abandon_taiwan',
          targetLocationId: 'loc_dock',
          actionText: '【順從朝臣意見建議棄守】將全島居民強遷大陸，任由海盜與列強佔據。',
          badge: '🌊 棄守 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '島民內遷生離死別，臺灣淪為無人看管的法外之地，西洋列強伺機據為殖民基地……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣遭西方海軍提前佔領瓜分，東亞地緣政治版圖大幅改寫。'
          },
          examReviewNote: '段考警示：清領初期對臺治理抱持「防臺甚於治臺」的消極態度，出臺嚴格的渡臺禁令與劃界封山。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 4 章 角色 1：八堡圳墾首 施世榜 (shi_shibang)
    // ------------------------------------------------------------------------
    node_shi_babao_construction: {
      id: 'node_shi_babao_construction',
      eraId: 'era_04_early_qing',
      characterId: 'shi_shibang',
      title: '八堡圳墾首施世榜：濁水溪進水口頻頻潰決，如何引水灌溉萬頃良田？',
      description: '彰化平原乾旱水荒，施世榜集資開鑿水圳，卻在濁水溪口屢遭山洪沖毀堤防！',
      historicalContext: '清領前期施世榜集資引濁水溪修築「八堡圳」（全臺最大古圳），後相傳由林先生指導以「水籠法（石笱）」成功導水入圳。',
      targetLocationId: 'loc_tea_firm', // 水工所
      options: [
        {
          id: 'opt_shi_use_shigou_method',
          targetLocationId: 'loc_tea_firm',
          actionText: '【採納林先生水籠石笱工法】以竹編石笱定錨分水，大圳滔滔灌溉彰化十三堡！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_babao_canal_map',
          isHistorical: true,
          baseCost: 110,
          baseReward: 460,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '濁水溪水奔流入圳！八堡圳灌溉萬頃沃土，彰化一躍成為全臺米倉，墾民家家豐收！',
            historicalFactSummary: '【史實演進】清領前期大型水利設施：施世榜「八堡圳（濁水溪）」、郭錫瑠「瑠公圳（新店溪）」、曹謹「曹公圳（高屏溪）」，奠定臺灣米糖農業基礎。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：三大古圳對照——八堡圳（施世榜／彰化／濁水溪）、瑠公圳（郭錫瑠／臺北／新店溪）、曹公圳（曹謹／高雄／高屏溪）。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_shi_give_up',
          targetLocationId: 'loc_sugar_guild',
          actionText: '【半途而廢放棄開圳】任由工程廢棄，農田繼續忍受看天乾旱。',
          badge: '🏜️ 荒廢 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 70,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '乾旱連年禾苗枯焦，墾民破產流亡，彰化平原淪為盜匪橫行的荒野……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏大型水利支撐，清領前期臺灣米糧無法自給自足，對岸對渡貿易嚴重受挫。'
          },
          examReviewNote: '段考警示：水利灌溉系統是促成臺灣從粗放游耕走向集約定居稻作社會的最核心基礎建設。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 4 章 角色 2：民變領袖 朱一貴 (zhu_yigui)
    // ------------------------------------------------------------------------
    node_zhu_yigui_rebellion: {
      id: 'node_zhu_yigui_rebellion',
      eraId: 'era_04_early_qing',
      characterId: 'zhu_yigui',
      title: '鴨母王朱一貴：臺灣知府王珍貪婪橫暴，如何號召高屏墾民抗暴起義？',
      description: '清廷官吏嚴苛勒索民財、擅扣建材，民怨沸騰，朱一貴以養鴨為掩護聚義抗清！',
      historicalContext: '1721年「朱一貴事件」為清領三大民變之首（俗稱鴨母王），數日攻克府城；事後清廷為加強統治，增設彰化縣與淡水廳。',
      targetLocationId: 'loc_customs', // 攻打府衙
      options: [
        {
          id: 'opt_zhu_uprising',
          targetLocationId: 'loc_customs',
          actionText: '【率眾起義攻克臺灣府城】反抗貪官暴斂，以「中興大元帥」號召全島同胞！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_zhu_yigui_banner',
          isHistorical: true,
          baseCost: 80,
          baseReward: 420,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '起義軍旗號招展，一呼百應攻入府城！震撼清廷高層，迫使朝廷重新審視臺灣治理制度！',
            historicalFactSummary: '【史實演進】清領三大民變：朱一貴（1721年，增設彰化縣與淡水廳）、林爽文（1786年，規模最大，乾隆賜名嘉義）、戴潮春（1862年，歷時最久）。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：清領三大民變「朱一貴、林爽文、戴潮春」口訣，朱一貴事件後清廷增設「彰化縣」與「淡水廳」。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_zhu_compromise',
          targetLocationId: 'loc_smuggler',
          actionText: '【隱忍不發繳清勒索】順從官差任意敲詐，解散鄉民聚會。',
          badge: '⛓️ 隱忍 If 路線',
          isHistorical: false,
          baseCost: 50,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '貪官變本加厲，鄉民田宅悉數遭沒收，高屏農民淪為官府奴僕……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】官逼民反機制中斷，清廷維持高度消極防守，中部北部行政機構遲遲未設。'
          },
          examReviewNote: '段考警示：清領前期臺灣民變多由「官逼民反」引起，諺語「三年一小反，五年一大亂」道盡治理失當。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 4 章 角色 3：艋舺三郊大掌櫃 (jiao_boss)
    // ------------------------------------------------------------------------
    node_jiao_merchant_market: {
      id: 'node_jiao_merchant_market',
      eraId: 'era_04_early_qing',
      characterId: 'jiao_boss',
      title: '艋舺三郊大掌櫃：港道淤積且族群械鬥頻傳，郊商如何維繫米糖商脈？',
      description: '一府二鹿三艋舺全盛時代，北郊與泉郊商行富甲一方，然而漳泉械鬥與港道泥沙正威脅貿易通途！',
      historicalContext: '「一府二鹿三艋舺」說明清領前期臺灣商業重心南向北移；郊商（同業商業公會）掌控兩岸對渡米糖貿易，同時需面對激烈的分類械鬥。',
      targetLocationId: 'loc_sugar_guild', // 郊商公館
      options: [
        {
          id: 'opt_jiao_coordinate_trade',
          targetLocationId: 'loc_sugar_guild',
          actionText: '【訂立郊商規約調解械鬥】統籌對渡帆船配額，穩定米糖收購價格護商路！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_jiao_guild_seal',
          isHistorical: true,
          baseCost: 100,
          baseReward: 460,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '郊商大印落下！兩岸帆船百舶齊聚艋舺渡頭，米糖流通暢達，締造「一府二鹿三艋舺」盛世榮景！',
            historicalFactSummary: '【史實演進】清領前期商業公會稱為「郊」（如北郊、泉郊、糖郊），一府二鹿三艋舺的興起反映臺灣拓墾重心逐漸由南向北推移。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：「一府二鹿三艋舺」港市興起時序與意義；「郊」為清代商業同業公會組織。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_jiao_fuel_conflict',
          targetLocationId: 'loc_smuggler',
          actionText: '【暗中出資資助分類械鬥】挑起漳泉爭奪碼頭，藉機火中取栗。',
          badge: '🔥 械鬥 If 路線',
          isHistorical: false,
          baseCost: 80,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '械鬥之火燒遍街頭，商鋪棧房全數毀於兵燹，兩岸對渡航運中斷數年……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】分類械鬥撕裂移民社會，艋舺商業提早衰落，商業榮景轉移至大稻埕。'
          },
          examReviewNote: '段考警示：清領臺灣分類械鬥主因包括爭奪水源土地、原籍意識（漳泉/閩粵）與官府無力仲裁。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 5 章 示範人物 3：海防欽差大臣 沈葆楨 (shen_baozhen)
    // ------------------------------------------------------------------------
    node_shen_baozhen_reforms: {
      id: 'node_shen_baozhen_reforms',
      eraId: 'era_05_late_qing',
      characterId: 'shen_baozhen',
      title: '欽差大臣沈葆楨：牡丹社事件後日本覬覦臺灣，如何大刀闊斧變革海防？',
      description: '牡丹社事件日本出兵侵犯恆春半島，沈葆楨受命以欽差大臣身分督辦海防，臺灣治政策迎來重大轉折！',
      historicalContext: '牡丹社事件（1874）後清廷治臺轉為積極：沈葆楨築「億載金城（二鯤鯓砲台）」、奏請「廢除渡臺禁令」、推行「開山撫番」闢北中南三路，並增設臺北府。',
      targetLocationId: 'loc_customs', // 海防公署 / 億載金城
      options: [
        {
          id: 'opt_shen_active_defense',
          targetLocationId: 'loc_customs',
          actionText: '【築億載金城＋廢渡臺禁令與開山撫番】配備西洋巨砲，闢建北中南橫貫道路！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_shen_coastal_fort',
          isHistorical: true,
          baseCost: 110,
          baseReward: 480,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '億載金城威武屹立！渡臺禁令正式解除，開山拓土打通後山，臺灣海防自此由消極轉為積極大步邁進！',
            historicalFactSummary: '【史實演進】沈葆楨治臺政績：築億載金城砲台、廢渡臺禁令、開山撫番（八通關古道為中路）、增設臺北府與恆春縣，奠定建省基礎。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：沈葆楨海防現代化貢獻——億載金城（全臺首座西式砲台）、廢除渡臺禁令、開山撫番（北中南三路）、設臺北府。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_shen_passive_retreat',
          targetLocationId: 'loc_smuggler',
          actionText: '【維持封山政策消極防守】賠款退讓，不修西式砲台與道路。',
          badge: '🛡️ 守舊 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '後山海防形同虛設，列強各國軍艦隨意侵擾測繪，東南海防徹底門戶大開……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】缺乏現代防禦體系，在中法戰爭中基隆與澎湖遭法軍全數佔領，臺灣失去建省自強機遇。'
          },
          examReviewNote: '段考警示：牡丹社事件為清廷治理臺灣由「消極封禁」轉為「積極經營」的歷史分水嶺。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 6 章 角色 3：抗暴頭目 莫那・魯道 (mona_rudao)
    // ------------------------------------------------------------------------
    node_mona_wushe_uprising: {
      id: 'node_mona_wushe_uprising',
      eraId: 'era_06_japanese_rule',
      characterId: 'mona_rudao',
      title: '莫那・魯道頭目：日本理蕃警察壓迫日深，如何捍衛祖靈尊嚴發動抗暴？',
      description: '賽德克族人長期遭受日本警察強制苦役勞動與言語羞辱，頭目莫那・魯道決定率領六社起義！',
      historicalContext: '1930年賽德克族馬赫坡社頭目莫那・魯道聯合六社發動「霧社事件」，為日治時期臺灣原住民族規模最大、最後一次武裝抗日事件。',
      targetLocationId: 'loc_smuggler', // 霧社公學校伏擊
      options: [
        {
          id: 'opt_mona_ancestral_fight',
          targetLocationId: 'loc_smuggler',
          actionText: '【發動霧社抗暴維護祖靈尊嚴】在彩虹橋前誓死抗爭，震撼殖民政府理蕃政策！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_mona_ancestral_oath',
          isHistorical: true,
          baseCost: 90,
          baseReward: 420,
          criticalChance: 0.7,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '戰歌響徹中央山脈！莫那・魯道帶領勇士奮勇作戰，以鮮血捍衛了原住民族祖靈獵場的無上尊嚴！',
            historicalFactSummary: '【史實演進】霧社事件迫使日本總督府徹底檢討野蠻的理蕃政策，隨後將生還族人強遷至川中島（今清流部落）嚴加監控。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：霧社事件（1930年）為日治時期原住民最後武裝抗日；余清芳「西來庵事件（1915年）」為漢人最後武裝抗日。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_mona_surrender_culture',
          targetLocationId: 'loc_customs',
          actionText: '【順從皇民化政策放棄信仰】改日本姓名，任由族人淪為無休止勞役苦力。',
          badge: '⛓️ 屈辱 If 路線',
          isHistorical: false,
          baseCost: 50,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '部落文化迅速被同化湮滅，族人失去傳統紋面與獵場認同，族群記憶蕩然無存……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】原住民族自主精神消亡，臺灣山林傳統文化徹底斷層。'
          },
          examReviewNote: '段考警示：日治理蕃政策由早期的軍事鎮壓（討伐）、五年理蕃計畫，逐步轉向同化與皇民化政策。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 7 章 角色 1：土地改革推手 陳誠 (chen_cheng)
    // ------------------------------------------------------------------------
    node_chen_cheng_land_reform: {
      id: 'node_chen_cheng_land_reform',
      eraId: 'era_07_postwar_modern',
      characterId: 'chen_cheng',
      title: '改革推手陳誠：戰後佃農租穀負擔沉重、物價飛騰，如何落實土地改革？',
      description: '戰後初期惡性通貨膨脹肆虐、農村地租高達產量一半以上，陳誠全力推展和平土地改革三部曲！',
      historicalContext: '戰後政府推動和平土地改革三部曲：三七五減租（地租不得超過產量37.5%）、公地放領、耕者有其田，提升農業生產力並使地主資本轉入工商業。',
      targetLocationId: 'loc_customs', // 臺灣省政府公署
      options: [
        {
          id: 'opt_chen_cheng_three_stage_reform',
          targetLocationId: 'loc_customs',
          actionText: '【落實三七五減租與耕者有其田】地租降至37.5%，徵收地主超額土地放領佃農！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_land_reform_order',
          isHistorical: true,
          baseCost: 100,
          baseReward: 460,
          criticalChance: 0.65,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '佃農歡慶擁有自家田地！農村生產力激增，地主獲取四大國營公司股票轉投資工商業，臺灣農業社會成功轉型！',
            historicalFactSummary: '【史實演進】戰後土地改革順序：三七五減租（1949）→公地放領（1951）→耕者有其田（1953），奠定臺灣經濟起飛與社會穩定根基。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：土地改革三部曲時序——①三七五減租、②公地放領、③耕者有其田；以四大公司股票（台泥、台紙、工礦、農林）補償地主。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_chen_delay_reform',
          targetLocationId: 'loc_smuggler',
          actionText: '【屈從大地主施壓無限延宕】維持高額地租，放任佃農繼續背負重債。',
          badge: '⚠️ 拖延 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 90,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '農村破產動盪不斷，糧食產量銳減，城鄉貧富差距急遽惡化引發普遍社會動盪……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】農業未能積累資本支持工業，臺灣進口替代與出口導向經濟轉型徹底失敗。'
          },
          examReviewNote: '段考警示：戰後「以農業培養工業，以工業發展農業」政策的成功，端賴土地改革釋放的巨大農村生產力。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 7 章 角色 2：科技擘劃者 孫運璿與李國鼎 (sun_yunsuan)
    // ------------------------------------------------------------------------
    node_sun_hsinchu_park_setup: {
      id: 'node_sun_hsinchu_park_setup',
      eraId: 'era_07_postwar_modern',
      characterId: 'sun_yunsuan',
      title: '科技推手孫運璿與李國鼎：石油危機重創傳統代工，如何帶領臺灣跨入半導體？',
      description: '1970年代全球石油危機爆發，傳統勞力密集工業面臨瓶頸，政府決定創辦科學園區引進積體電路高科技！',
      historicalContext: '李國鼎與孫運璿主導推動「十大建設」強化重工業交通基礎，並引進RCA半導體技術，於1980年成立「新竹科學工業園區」，孕育臺積電等半導體護國神山。',
      targetLocationId: 'loc_tea_firm', // 新竹科學園區實驗室
      options: [
        {
          id: 'opt_sun_build_hsinchu_park',
          targetLocationId: 'loc_tea_firm',
          actionText: '【創設新竹科學園區引進晶圓代工】延攬海外學人，打造臺灣半導體高科技矽島！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_hsinchu_park_charter',
          isHistorical: true,
          baseCost: 120,
          baseReward: 500,
          criticalChance: 0.7,
          criticalMultiplier: 2.2,
          consequence: {
            narrative: '竹科硅谷崛起！晶圓代工技術領先全球，高科技產業成為推動臺灣經濟奇蹟的護國神山動脈！',
            historicalFactSummary: '【史實演進】1970年代十大建設奠定基礎，1980年新竹科學園區成立，臺灣經濟由「勞力密集輕工業」成功升級為「高科技資本技術密集產業」。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：臺灣經濟發展四階段——①1950年代進口替代（紡織、民生輕工業）、②1960年代出口導向（加工出口區）、③1970年代第二次進口替代（十大建設、重工業）、④1980年代高科技產業（新竹科學園區）。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_sun_stay_low_cost',
          targetLocationId: 'loc_dock',
          actionText: '【墨守低價代工放棄高科技】拒絕投入巨資研發半導體，繼續生產塑膠玩具。',
          badge: '🧸 停滯 If 路線',
          isHistorical: false,
          baseCost: 60,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '隨著工資上漲，傳統代工廠紛紛倒閉外移，臺灣經濟陷入長期停滯蕭條……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣錯過全球PC與半導體革命，在亞洲四小龍競爭中大幅落後邊緣化。'
          },
          examReviewNote: '段考警示：及時推動產業升級與科技園區政策是臺灣位列「亞洲四小龍」的最重要分水嶺。',
          nextNodeId: 'node_settlement'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // 第 7 章 角色 3：民主先生 李登輝 (lee_tenghui)
    // ------------------------------------------------------------------------
    node_lee_direct_democracy: {
      id: 'node_lee_direct_democracy',
      eraId: 'era_07_postwar_modern',
      characterId: 'lee_tenghui',
      title: '民主先生李登輝：野百合學運呼喚憲政改革，如何推動總統公民直選？',
      description: '中正紀念堂數萬大學生發起野百合學運，要求解散萬年國會與落實完全民主，李登輝面臨憲政歷史抉擇！',
      historicalContext: '1990年代李登輝順應野百合學運訴求，宣告終止《動員戡亂時期臨時條款》、推動老國代退職與國會全面改選，並於1996年落實中華民國首次總統公民直接選舉。',
      targetLocationId: 'loc_customs', // 總統府憲政大廳
      options: [
        {
          id: 'opt_lee_constitutional_reform',
          targetLocationId: 'loc_customs',
          actionText: '【終止動員戡亂＋推動國會改選與全民總統直選】順應野百合學運民意，和平完成民主寧靜革命！',
          badge: '👑 史實決策 (推薦)',
          requiredClueId: 'clue_constitutional_reform',
          isHistorical: true,
          baseCost: 110,
          baseReward: 480,
          criticalChance: 0.75,
          criticalMultiplier: 2.0,
          consequence: {
            narrative: '票箱開啟，公民神聖一票！1996年臺灣完成歷史上首次總統直選，和平締造亞洲民主典範的「寧靜革命」！',
            historicalFactSummary: '【史實演進】1991年終止動員戡亂時期、廢除臨時條款；1992年國會全面改選；1996年首次公民直選總統，臺灣正式邁入成熟民主體制。',
            ifButterflyEffect: ''
          },
          examReviewNote: '國中段考必考點：臺灣民主化重大里程碑——1987年蔣經國宣布解除戒嚴；1990年野百合學運；1991年終止動員戡亂；1996年首次總統公民直接選舉。',
          nextNodeId: 'node_settlement'
        },
        {
          id: 'opt_lee_crackdown',
          targetLocationId: 'loc_smuggler',
          actionText: '【動用戒嚴武力驅散學運】維持萬年國會，拒絕修改動員戡亂法規。',
          badge: '🚨 威權 If 路線',
          isHistorical: false,
          baseCost: 70,
          baseReward: 80,
          criticalChance: 0.1,
          criticalMultiplier: 1.0,
          consequence: {
            narrative: '社會爆發巨大對立抗爭，國際社會實施制裁，民主化進程遭重創延宕數十年……',
            historicalFactSummary: '',
            ifButterflyEffect: '【If 架空連鎖反應】臺灣民主進程中斷，陷入威權戒嚴體制泥淖，失去國際民主同盟支持。'
          },
          examReviewNote: '段考警示：解嚴與終止動員戡亂使得臺灣人民重新獲得結社自由、言論自由與憲法保障的公民參政權。',
          nextNodeId: 'node_settlement'
        }
      ]
    }
  };

  // ==========================================================================
  // 四、 無痛情報秘笈專屬庫 (Clue Database for Anti-Guessing Mechanism)
  // ==========================================================================
  const CURRICULUM_CLUES = {
    // 第 1 章 史前時代
    clue_changbin_flaked_stone: {
      id: 'clue_changbin_flaked_stone',
      name: '八仙洞海蝕洞穴敲砸石核',
      icon: '🪨',
      rarity: 'SSR 遠古曙光',
      gameplayTip: '👉 前往【八仙洞海蝕洞穴】敲擊礫石打製石器，採集海產並燃起柴火防範野獸！',
      historicalLore: '📜 長濱文化為臺灣已知最古老的舊石器時代文化，以打製石器與用火遺跡聞名。',
      howToGet: '長濱敲砸獵人開局隨身錦囊'
    },
    clue_peinan_jade: {
      id: 'clue_peinan_jade',
      name: '卑南文化玉玦磨製秘卷',
      icon: '📿',
      rarity: 'SSR 史前工藝',
      gameplayTip: '👉 前往【卑南玉玦琢磨工坊】以石英砂與竹管精磨臺灣閃玉，建立史前南島航海貿易圈！',
      historicalLore: '📜 卑南遺址出土大量精美玉玦與石板棺，證明新石器晚期臺灣玉器工藝已享譽東南亞。',
      howToGet: '卑南玉工長老開局隨身錦囊 / 磨玉小遊戲'
    },
    clue_shisanhang_bellows: {
      id: 'clue_shisanhang_bellows',
      name: '十三行冶鐵高爐風門圖',
      icon: '🔥',
      rarity: 'SSR 冶鐵秘要',
      gameplayTip: '👉 前往【十三行高溫煉鐵工棚】操控風箱鍛造熟鐵器，與南洋商船以鐵器交換玻璃珠與銅錢！',
      historicalLore: '📜 十三行文化掌握高溫煉鐵技術，遺址出土玻璃珠與唐宋銅錢，開啟臺灣金屬器時代。',
      howToGet: '十三行鐵匠開局隨身錦囊 / 鼓風煉鐵小遊戲'
    },
    clue_amis_age_rank: {
      id: 'clue_amis_age_rank',
      name: '阿美族年齡階級集會律令',
      icon: '🌾',
      rarity: 'SSR 社會組織',
      gameplayTip: '👉 前往【部落聚會所與巨石祭柱】發動青年年齡階級巡護防衛海防，長老統籌祭儀穀糧！',
      historicalLore: '📜 阿美族為母系社會與男子年齡階級體系，青年集會所承擔部落防衛與公共勞役。',
      howToGet: '阿美族部落長老開局隨身錦囊 / 年齡階級操練小遊戲'
    },

    // 第 2 章
    clue_voc_deer: {
      id: 'clue_voc_deer',
      name: '大員鹿皮買辦契約書',
      icon: '🦌',
      rarity: 'SSR 商貿特產',
      gameplayTip: '👉 前往【赤崁市集】收購優質鹿皮，暗中繪製鹿耳門水道圖引鄭軍入臺！',
      historicalLore: '📜 荷治時期臺灣以鹿皮與砂糖為最大宗出口特產，外銷日本與中國賺取大量利潤。',
      howToGet: '何斌開局隨身錦囊 / 鹿皮分選小遊戲'
    },
    clue_voc_tariff: {
      id: 'clue_voc_tariff',
      name: '熱蘭遮城港務關稅冊',
      icon: '🏰',
      rarity: 'SSR 殖民法令',
      gameplayTip: '👉 前往【長官公署】審定各國商船進出關稅，加固熱蘭遮要塞砲台防務！',
      historicalLore: '📜 荷蘭東印度公司於大員建立轉口貿易據點，徵收嚴格關稅與人頭稅維繫要塞。',
      howToGet: '揆一開局隨身錦囊 / 港務審查小遊戲'
    },
    clue_voc_poll_tax: {
      id: 'clue_voc_poll_tax',
      name: '抗荷反苛稅起事血書',
      icon: '⚔️',
      rarity: 'SSR 起義檄文',
      gameplayTip: '👉 前往【赤崁市集】號召漢人墾民奪取普羅民遮城，抗擊荷蘭人頭重稅！',
      historicalLore: '📜 1652年郭懷一因不滿荷蘭苛徵人頭稅發動起義，促使荷蘭人增修普羅民遮城防守。',
      howToGet: '郭懷一開局隨身錦囊 / 起事動員小遊戲'
    },

    // 第 3 章
    clue_chen_confucian_temple: {
      id: 'clue_chen_confucian_temple',
      name: '全臺首學孔廟擘劃藍圖',
      icon: '📜',
      rarity: 'SSR 儒學文教',
      gameplayTip: '👉 前往【全臺首學參軍府】建孔廟設科舉，推廣淋鹵曬鹽法與軍屯自給自足！',
      historicalLore: '📜 陳永華建臺南孔廟「全臺首學」首開臺灣儒學科舉，並改革淋鹵曬鹽法改善民生。',
      howToGet: '陳永華開局隨身錦囊 / 曬鹽文教小遊戲'
    },
    clue_zheng_eic_treaty: {
      id: 'clue_zheng_eic_treaty',
      name: '英國東印度公司通商合約',
      icon: '🇬🇧',
      rarity: 'SSR 國際條約',
      gameplayTip: '👉 前往【英商通商館】批准英商設立商館，採購軍火火藥突破清廷封鎖！',
      historicalLore: '📜 1670年鄭經與英商簽約通商，採購槍砲火藥並外銷糖糖，為臺灣首部正式外貿合約。',
      howToGet: '鄭經開局隨身錦囊 / 經略洋務小遊戲'
    },
    clue_shi_memorial_draft: {
      id: 'clue_shi_memorial_draft',
      name: '《臺灣棄留疏》親筆奏章',
      icon: '🚢',
      rarity: 'SSR 海防奏章',
      gameplayTip: '👉 前往【水師提督府】力排眾議上呈《臺灣棄留疏》，促成康熙帝將臺灣設一府三縣納入版圖！',
      historicalLore: '📜 施琅澎湖戰勝後上呈《臺灣棄留疏》，力言「臺灣乃江浙閩粵之左護」，促成設府置縣。',
      howToGet: '施琅開局隨身錦囊 / 澎湖海戰沙盤推演'
    },

    // 第 4 章
    clue_babao_canal_map: {
      id: 'clue_babao_canal_map',
      name: '八堡圳濁水溪石笱水利圖',
      icon: '🌊',
      rarity: 'SSR 水利重寶',
      gameplayTip: '👉 前往【八堡圳水工所】運用石笱導引濁水溪，開鑿大圳灌溉彰化十三堡萬頃良田！',
      historicalLore: '📜 施世榜集資開鑿八堡圳，相傳林先生指導「水籠石笱法」成功分流，為清代臺灣最大水利工程。',
      howToGet: '施世榜開局隨身錦囊 / 水利石笱疏導小遊戲'
    },
    clue_zhu_yigui_banner: {
      id: 'clue_zhu_yigui_banner',
      name: '鴨母王中興抗暴義旗',
      icon: '🦆',
      rarity: 'SSR 民變號令',
      gameplayTip: '👉 前往【臺灣府衙門】率眾攻打府城，抗擊知府王珍貪婪苛徵！',
      historicalLore: '📜 朱一貴於1721年發動臺灣首個重大民變，促使清廷加強防備並增設彰化縣與淡水廳。',
      howToGet: '朱一貴開局隨身錦囊 / 義軍集結小遊戲'
    },
    clue_jiao_guild_seal: {
      id: 'clue_jiao_guild_seal',
      name: '艋舺三郊金聯成大關防',
      icon: '🏮',
      rarity: 'SSR 郊商行規',
      gameplayTip: '👉 前往【艋舺三郊公館】訂立對渡米糖配額公約，調解漳泉械鬥護衛商街！',
      historicalLore: '📜 郊商為清領時期商業同業公會，「一府二鹿三艋舺」展現對渡米糖貿易與市街繁榮。',
      howToGet: '艋舺三郊大掌櫃開局隨身錦囊 / 兩岸對渡理貨小遊戲'
    },

    // 第 5 章
    clue_dodd_tea_contract: {
      id: 'clue_dodd_tea_contract',
      name: '寶順洋行外銷烏龍茶約簿',
      icon: '🍵',
      rarity: 'SSR 開港茶金',
      gameplayTip: '👉 前往【寶順洋行】簽訂安溪製茶師契約，精焙 Formosa Oolong 茶直銷紐約大賺銀兩！',
      historicalLore: '📜 陶德引進安溪茶苗並資助茶農，使臺灣烏龍茶直接外銷歐美，造就大稻埕繁榮並使經濟重心北移。',
      howToGet: '陶德洋商開局隨身錦囊 / 炭火焙籠精焙小遊戲'
    },
    clue_liu_railway_blueprint: {
      id: 'clue_liu_railway_blueprint',
      name: '基隆新竹鐵道工務圖抄本',
      icon: '🚂',
      rarity: 'SSR 自強新政',
      gameplayTip: '👉 前往【官署長官廳】頒布蒸汽鐵路興築令，開通獅球嶺隧道，打通臺灣南北現代化命脈！',
      historicalLore: '📜 劉銘傳自強新政首重交通，興修基隆至新竹鐵路與新式郵政局，使臺灣成為近代化示範省。',
      howToGet: '劉銘傳巡撫開局隨身錦囊 / 蒸汽軌道拼裝小遊戲'
    },
    clue_shen_coastal_fort: {
      id: 'clue_shen_coastal_fort',
      name: '安平億載金城築砲工事冊',
      icon: '🏰',
      rarity: 'SSR 海防要塞',
      gameplayTip: '👉 前往【億載金城公署】督建西式砲台，奏請廢除渡臺禁令與推動開山撫番！',
      historicalLore: '📜 牡丹社事件後沈葆楨來臺積極自強：築億載金城砲台、廢除渡臺禁令並闢建後山三路。',
      howToGet: '沈葆楨開局隨身錦囊 / 砲台築城小遊戲'
    },

    // 第 6 章
    clue_clinical_notes: {
      id: 'clue_clinical_notes',
      name: '蔣渭水《臨床講義》手稿',
      icon: '🩺',
      rarity: 'SSR 啟蒙綱領',
      gameplayTip: '👉 前往【文協講堂】號召成立臺灣文化協會與《臺灣民報》，以和平合法演講醫治知識營養不良！',
      historicalLore: '📜 蔣渭水以醫師視角診斷臺灣患「知識營養不良症」，主張以文化啟蒙與讀報社喚醒臺灣人民族自決意識。',
      howToGet: '蔣渭水開局隨身錦囊 / 油墨印報讀報社小遊戲'
    },
    clue_wusanto_blueprint: {
      id: 'clue_wusanto_blueprint',
      name: '烏山頭大圳三年輪作給水圖',
      icon: '💧',
      rarity: 'SSR 近代水利',
      gameplayTip: '👉 前往【水利政務署】實施「三年輪作給水法」，按水稻、甘蔗、雜糧分配大圳水源！',
      historicalLore: '📜 八田與一設計烏山頭水庫與嘉南大圳，独創三年輪作給水法克服缺水看天田，奠定米倉基礎。',
      howToGet: '八田與一開局隨身錦囊 / 水閘調控輪作小遊戲'
    },
    clue_mona_ancestral_oath: {
      id: 'clue_mona_ancestral_oath',
      name: '賽德克祖靈彩虹橋盟誓',
      icon: '🦅',
      rarity: 'SSR 原民戰誓',
      gameplayTip: '👉 前往【抗暴聚落】發動霧社事件抗擊日本理蕃壓迫，捍衛賽德克祖靈尊嚴！',
      historicalLore: '📜 1930年莫那・魯道率賽德克六社起義發動霧社事件，為日治原住民最後也是最壯烈之抗暴事件。',
      howToGet: '莫那・魯道開局隨身錦囊 / 祖靈盟誓小遊戲'
    },

    // 第 7 章
    clue_land_reform_order: {
      id: 'clue_land_reform_order',
      name: '三七五減租與耕者有其田政令',
      icon: '📜',
      rarity: 'SSR 土地改革',
      gameplayTip: '👉 前往【省府大樓】頒布三七五減租與耕者有其田，提升佃農自主性並使地主投資工業！',
      historicalLore: '📜 陳誠推行土地改革三部曲，和平解除封建租約佃農負擔，促成臺灣農業增產與經濟起飛。',
      howToGet: '陳誠開局隨身錦囊 / 土地合約重簽小遊戲'
    },
    clue_hsinchu_park_charter: {
      id: 'clue_hsinchu_park_charter',
      name: '新竹科學工業園區籌設專案',
      icon: '💻',
      rarity: 'SSR 高科技轉型',
      gameplayTip: '👉 前往【竹科研發中心】引進積體電路技術，創辦晶圓半導體聚落，打造科技矽島！',
      historicalLore: '📜 孫運璿與李國鼎推動成立新竹科學園區與工研院，引進美超微半導體技術，奠定臺灣高科技矽島。',
      howToGet: '孫運璿/李國鼎開局隨身錦囊 / 晶圓光罩研發小遊戲'
    },
    clue_constitutional_reform: {
      id: 'clue_constitutional_reform',
      name: '終止動員戡亂全民直選宣告',
      icon: '🗳️',
      rarity: 'SSR 民主憲政',
      gameplayTip: '👉 前往【憲政大樓】終止動員戡亂時期，落實國會全面改選與全民總統直選！',
      historicalLore: '📜 1990年代李登輝順應野百合學運訴求，終止動員戡亂並推動修憲，於1996年完成首次全民直選總統。',
      howToGet: '李登輝開局隨身錦囊 / 民主投票箱小遊戲'
    }
  };

  // ==========================================================================
  // 五、 段考複習模式渲染引擎 (Exam Prep Review Card Engine)
  // ==========================================================================
  function renderExamPrepReportCard(characterId, decisionOption, onCloseCallback) {
    const char = CURRICULUM_CHARACTERS[characterId];
    if (!char) {
      if (typeof onCloseCallback === 'function') onCloseCallback();
      return;
    }

    // 移除現存彈窗（若有）
    const existingModal = document.getElementById('exam-review-modal');
    if (existingModal) existingModal.remove();

    const pointsListHtml = char.examPoints.map(pt => `
      <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-400/40 text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-extrabold text-amber-300 text-sm">❖ ${pt.standardTerm}</span>
          <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-600/40 text-blue-200 border border-blue-400/30">${pt.topic}</span>
        </div>
        <p class="text-slate-200 text-xs sm:text-sm leading-relaxed">${pt.frequentQuestionNote}</p>
      </div>
    `).join('');

    const modalHtml = `
      <div id="exam-review-modal" class="moba-modal-backdrop flex items-center justify-center p-3 sm:p-4 z-[120] fixed inset-0 bg-black/85 backdrop-blur-md">
        <div class="parchment-bg max-w-lg w-full p-5 sm:p-7 rounded-3xl border-2 border-amber-400 shadow-2xl relative bg-slate-950 text-white max-h-[90vh] overflow-y-auto">
          <!-- 頂部身分與榮譽徽章 -->
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
            <div class="flex items-center gap-3">
              <span class="text-3xl sm:text-4xl p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 shadow-inner">${char.avatar}</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-serif font-black text-xl sm:text-2xl text-amber-200">${char.name}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold border border-amber-400/40">${char.stanceBadge}</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 font-medium">${char.title} ｜ 專屬指標：${char.customResourceName}</p>
              </div>
            </div>
            <span class="px-3 py-1.5 rounded-full text-xs font-black shadow ${decisionOption.isHistorical ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}">
              ${decisionOption.isHistorical ? '✔ 史實正軌' : '⚡ If 架空路線'}
            </span>
          </div>

          <!-- 歷史演進結果反饋 -->
          <div class="p-4 rounded-2xl ${decisionOption.isHistorical ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-100' : 'bg-amber-950/60 border border-amber-500/40 text-amber-100'} mb-4 text-left">
            <div class="flex items-center gap-1.5 font-black text-sm mb-1.5 ${decisionOption.isHistorical ? 'text-emerald-300' : 'text-yellow-300'}">
              <span>${decisionOption.isHistorical ? '📜' : '🦋'}</span>
              <span>${decisionOption.isHistorical ? '【史實演進回顧】' : '【歷史蝴蝶效應反思】'}</span>
            </div>
            <p class="text-xs sm:text-sm leading-relaxed text-slate-200">
              ${decisionOption.isHistorical ? decisionOption.consequence.historicalFactSummary : decisionOption.consequence.ifButterflyEffect}
            </p>
          </div>

          <!-- 108 課綱國中臺灣史段考考點速記 (核心教育價值) -->
          <div class="mb-5 text-left">
            <div class="flex items-center gap-2 mb-2 text-amber-300 font-black text-sm sm:text-base">
              <span>📝</span>
              <span>【國中段考命中】課綱關鍵高頻出題解析</span>
            </div>
            <div class="space-y-2.5">
              ${pointsListHtml}
            </div>
            ${decisionOption.examReviewNote ? `
              <div class="mt-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-400/40 text-blue-200 text-xs leading-relaxed">
                <strong>💡 本題解析提示：</strong>${decisionOption.examReviewNote}
              </div>
            ` : ''}
          </div>

          <!-- 底部操作按鈕 -->
          <button id="btn-close-exam-review" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base shadow-xl transition-transform active:scale-95 cursor-pointer">
            掌握考點，收錄至「段考歷史錦囊筆記」！
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('exam-review-modal');
    const closeBtn = document.getElementById('btn-close-exam-review');
    if (closeBtn) {
      const handleClose = (e) => {
        if (e) e.stopPropagation();
        if (modalEl) modalEl.remove();
        if (typeof onCloseCallback === 'function') {
          onCloseCallback();
        }
      };
      closeBtn.onclick = handleClose;
    }
  }

  // 建立 21 大核心角色與課綱人物別名映射
  CURRICULUM_CHARACTERS.changbin_hunter = {
    id: 'changbin_hunter',
    eraId: 'era_01_prehistory',
    name: '長濱敲砸獵人',
    title: '長濱八仙洞敲砸獵人',
    stance: 'civilian_hunter',
    stanceBadge: '🪨 舊石器獵人',
    avatar: '🪨',
    missionGoal: '在八仙洞海蝕洞穴敲擊礫石打製石器，採集海產並燃起柴火禦寒防獸',
    customResourceName: '物資玉貝',
    initialStats: { resource: 80, reputation: 30, historicalInsight: 35 },
    startingClueId: 'clue_changbin_flaked_stone',
    examPoints: [
      {
        id: 'exp_01_changbin_01',
        topic: '臺灣已知最古老的舊石器時代文化——長濱文化',
        keyConcept: '長濱文化（臺東長濱八仙洞海蝕洞穴）距今約 3 萬至 5000 年前，是臺灣目前已知最古老的舊石器時代史前文化。先民使用「打製石器（礫石單面砍砸器、刮削器）」並「已知用火」，過著採集與漁獵生活，尚未進入農業與燒陶時代。',
        examFrequency: '★★★★★ 國中會考與段考超高頻考點',
        mnemonicPhrase: '舊石器長濱八仙洞：打製石器已知用火，採集漁獵住海洞！'
      }
    ]
  };
  CURRICULUM_CHARACTERS.peinan_artisan = CURRICULUM_CHARACTERS.peinan_elder;
  CURRICULUM_CHARACTERS.amis_elder = CURRICULUM_CHARACTERS.amis_matriarch;
  CURRICULUM_CHARACTERS.jiao_boss = CURRICULUM_CHARACTERS.jiao_merchant;
  CURRICULUM_CHARACTERS.hatta_yoichi = CURRICULUM_CHARACTERS.yoichi_hatta;
  if (!CURRICULUM_CHARACTERS.he_bin) {
    CURRICULUM_CHARACTERS.he_bin = {
      id: 'he_bin',
      eraId: 'era_02_international',
      name: '何斌',
      title: '赤崁鹿皮通事／引鄭入臺',
      stance: 'civilian_trade',
      stanceBadge: '🦌 平民商人',
      avatar: '🦌',
      missionGoal: '折衝鹿皮收購價，突破荷蘭重稅，暗中繪製鹿耳門水道圖引鄭軍入臺',
      customResourceName: '鹿皮貿易銀兩',
      initialStats: { resource: 200, reputation: 35, historicalInsight: 50 },
      startingClueId: 'clue_voc_deer',
      exclusiveMinigameId: 'game_deer_fur_sorting',
      minigameName: '鹿皮等級品檢與秤重',
      examPoints: [
        {
          id: 'exp_02_hebin_01',
          topic: '對外關係與開墾',
          standardTerm: '何斌與鄭成功入臺',
          frequentQuestionNote: '何斌原為荷治時期通事，因欠稅與荷蘭長官交惡投奔廈門，向鄭成功獻上臺灣地圖與鹿耳門水道情報，促成鄭軍攻臺驅荷。'
        }
      ],
      firstNodeId: 'node_1642_deer_tax'
    };
  }

  // ==========================================================================
  // 自動補齊與標準化所有課綱節點屬性 (相容舊版模型引擎與全新全篇章 RPG)
  // ==========================================================================
  for (const nodeId in CURRICULUM_EVENT_NODES) {
    const node = CURRICULUM_EVENT_NODES[nodeId];
    if (!node.era && node.eraId) {
      const eraObj = CURRICULUM_ERAS.find(e => e.id === node.eraId);
      if (eraObj) {
        node.era = `${eraObj.timeline} · ${eraObj.periodName}`;
      }
    }
    if (Array.isArray(node.options)) {
      for (const opt of node.options) {
        if (!opt.requiredClues) {
          opt.requiredClues = opt.requiredClueId ? [opt.requiredClueId] : [];
        }
        if (!opt.text && opt.actionText) {
          opt.text = opt.actionText;
        }
        if (opt.baseSilverReward === undefined && opt.baseReward !== undefined) {
          opt.baseSilverReward = opt.baseReward;
        }
        if (opt.consequence) {
          if (!opt.consequence.historicalOutcome && opt.consequence.historicalFactSummary) {
            opt.consequence.historicalOutcome = opt.consequence.historicalFactSummary;
          }
          if (!opt.consequence.ifOutcome && opt.consequence.ifButterflyEffect) {
            opt.consequence.ifOutcome = opt.consequence.ifButterflyEffect;
          }
        }
      }
    }
  }

  // ==========================================================================
  // 六、 導出至全局作用域 (Export to Global Window)
  // ==========================================================================
  window.TAIWAN_HISTORY_CURRICULUM = {
    ERAS: CURRICULUM_ERAS,
    CHARACTERS: CURRICULUM_CHARACTERS,
    EVENT_NODES: CURRICULUM_EVENT_NODES,
    CLUES: CURRICULUM_CLUES,
    renderExamPrepReportCard: renderExamPrepReportCard
  };

})(window);
