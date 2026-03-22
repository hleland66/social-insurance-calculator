import type { VocabularyTheme, VocabularyEntry } from '@/types';

const PINYIN_REGEX = /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;

export const THEME_VOCABULARY: Record<string, VocabularyTheme> = {
  超市: {
    core: ['收银台 shōu yín tái', '货架 huò jià', '购物车 gòu wù chē', '收银员 shōu yín yuán'],
    items: ['苹果 píng guǒ', '牛奶 niú nǎi', '面包 miàn bāo', '鸡蛋 jī dàn', '香蕉 xiāng jiāo', '酸奶 suān nǎi', '果汁 guǒ zhī', '糖果 táng guǒ'],
    env: ['入口 rù kǒu', '出口 chū kǒu', '价签 jià qiān', '冰柜 bīng guì', '灯光 dēng guāng'],
  },
  医院: {
    core: ['医生 yī shēng', '护士 hù shi', '病床 bìng chuáng', '挂号处 guà hào chù'],
    items: ['听诊器 tīng zhěn qì', '体温表 tǐ wēn biǎo', '药丸 yào wán', '针头 zhēn tóu', '血压计 xuè yā jì'],
    env: ['药房 yào fáng', '候诊区 hòu zhěn qū', '输液室 shū yè shì', '走廊 zǒu láng'],
  },
  公园: {
    core: ['滑梯 huá tī', '秋千 qiū qiān', '跷跷板 qiāo qiāo bǎn', '沙坑 shā kēng'],
    items: ['花朵 huā duǒ', '大树 dà shù', '小鸟 xiǎo niǎo', '蝴蝶 hú dié', '气球 qì qiú'],
    env: ['长椅 cháng yǐ', '路灯 lù dēng', '草地 cǎo dì', '喷泉 pēn quán'],
  },
  学校: {
    core: ['老师 lǎo shī', '黑板 hēi bǎn', '课桌 kè zhuō', '讲台 jiǎng tái'],
    items: ['书本 shū běn', '铅笔 qiān bǐ', '橡皮 xiàng pí', '书包 shū bāo', '尺子 chǐ zi'],
    env: ['教室 jiào shì', '操场 cāo chǎng', '图书馆 tú shū guǎn', '校门 xiào mén'],
  },
  动物园: {
    core: ['长颈鹿 cháng jǐng lù', '大象 dà xiàng', '猴子 hóu zi', '老虎 lǎo hǔ'],
    items: ['笼子 lóng zi', '标牌 biāo pái', '围栏 wéi lán', '喂食器 wèi shí qì'],
    env: ['入口广场 rù kǒu guǎng chǎng', '步行道 bù xíng dào', '休息区 xiū xi qū'],
  },
  消防站: {
    core: ['消防员 xiāo fáng yuán', '消防车 xiāo fáng chē', '消防栓 xiāo fáng shuān'],
    items: ['水枪 shuǐ qiāng', '水带 shuǐ dài', '头盔 tóu kuī', '梯子 tī zi'],
    env: ['车库 chē kù', '瞭望塔 liào wàng tǎ', '报警器 bào jǐng qì'],
  },
};

// 默认通用词汇
export const DEFAULT_VOCABULARY: VocabularyTheme = {
  core: ['孩子 hái zi', '朋友 péng you', '家人 jiā rén'],
  items: ['房子 fáng zi', '树 shù', '花 huā', '太阳 tài yáng', '云朵 yún duǒ'],
  env: ['天空 tiān kōng', '草地 cǎo dì', '道路 dào lù'],
};

// 获取词汇列表
export function getVocabulary(theme: string): VocabularyEntry[] {
  const vocabTheme = THEME_VOCABULARY[theme] || DEFAULT_VOCABULARY;

  const entries: VocabularyEntry[] = [];

  // 解析词汇字符串 "拼音 汉字" 或 "汉字 pinyin"
  function parseVocabItem(item: string, category: 'core' | 'items' | 'env'): VocabularyEntry {
    const parts = item.trim().split(/\s+/).filter(Boolean);
    // First part is hanzi, rest is pinyin
    const hanzi = parts[0];
    const pinyin = parts.slice(1).join(' ');
    return { category, pinyin, hanzi };
  }

  vocabTheme.core.forEach(item => entries.push(parseVocabItem(item, 'core')));
  vocabTheme.items.forEach(item => entries.push(parseVocabItem(item, 'items')));
  vocabTheme.env.forEach(item => entries.push(parseVocabItem(item, 'env')));

  return entries;
}

// 获取所有可用主题
export function getAvailableThemes(): string[] {
  return Object.keys(THEME_VOCABULARY);
}
