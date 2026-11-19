/** Жишээ дэлгүүр, бараа. Front-end-ийн mock-data-тай ижил (зураг нь front-end-ийн /items/*.svg) */
import { IMeasurement, IShop, ProductDecade, ProductGrade } from '@root/interfaces'

export interface SeedShop extends Pick<IShop, 'name' | 'slug' | 'city' | 'focus' | 'bio' | 'sold_count' | 'rating'> {
    district?: string
    phone: string
    owner: string
}

export const SEED_SHOPS: SeedShop[] = [
    {
        slug: 'hadgalsan-tsag',
        name: 'Хадгалсан Цаг',
        city: 'Улаанбаатар',
        district: 'Сүхбаатар дүүрэг',
        focus: 'хувцас, гоёл',
        bio: 'Бид 1950–90-ээд оны монгол хувцас, гоёл чимэглэл, гэр ахуйн эд зүйлсийг цуглуулж, цэвэрлэн засаад зардаг. Бараа бүрийг өдрийн гэрэлд зурагдаж, хэмжээг нь гараар хэмжинэ.',
        sold_count: 112,
        rating: 4.9,
        phone: '99110001',
        owner: 'Д. Ганболд'
    },
    {
        slug: 'goviin-avdar',
        name: 'Говийн Авдар',
        city: 'Даланзадгад',
        focus: 'эртний эдлэл',
        bio: 'Говийн айлуудаас цуглуулсан авдар, хөөрөг, зэс гуулин эдлэл.',
        sold_count: 41,
        rating: 4.8,
        phone: '99110002',
        owner: 'Б. Оюун'
    },
    {
        slug: 'retro-khoroolol',
        name: 'Ретро Хороолол',
        city: 'Улаанбаатар',
        district: 'Баянзүрх дүүрэг',
        focus: 'электроник, пянз',
        bio: 'Зөвлөлтийн үеийн радио, фотоаппарат, пянз. Бүгдийг ажиллагааг нь шалгаж зарна.',
        sold_count: 87,
        rating: 4.7,
        phone: '99110003',
        owner: 'Т. Мөнх'
    },
    {
        slug: 'hangain-huuchin',
        name: 'Хангайн Хуучин',
        city: 'Хархорин',
        focus: 'тоглоом, цуглуулга',
        bio: 'Хүүхэд насны тоглоом, марк, тэмдэг, дурсгалын зүйлс.',
        sold_count: 33,
        rating: 4.9,
        phone: '99110004',
        owner: 'Э. Саран'
    }
]

export interface SeedProduct {
    slug: string
    name: string
    category: string
    era: string
    decade: ProductDecade
    price: number
    grade: ProductGrade
    shop: string
    description?: string
    grade_note?: string
    size?: string
    material?: string
    color?: string
    measurements?: IMeasurement[]
}

const DEFAULT_DESC = 'Худалдагч төлөв, хэмжээг шалгаж бичсэн. Нэмэлт зураг хэрэгтэй бол худалдагчаас асуугаарай.'

const ROWS: [string, string, string, string, ProductDecade, number, ProductGrade, string][] = [
    ['deel', 'Ноосон дээл, торгон бүстэй', 'clothing', '1970-аад он', '70', 280000, 'A', 'hadgalsan-tsag'],
    ['chest', 'Будгаар чимсэн модон авдар', 'home', '1950-аад он', 'old', 1200000, 'B', 'goviin-avdar'],
    ['camera', '«Зенит-Е» хальсан аппарат', 'electronics', '1970-аад он', '70', 185000, 'A', 'retro-khoroolol'],
    ['bracelet', 'Мөнгөн бугуйвч, оюу шүрэнтэй', 'accessories', '1960-аад он', '60', 260000, 'A', 'hadgalsan-tsag'],
    ['snuff', 'Хаш хөөрөг, шүрэн таглаатай', 'antiques', 'XIX зууны сүүл', 'old', 650000, 'B', 'goviin-avdar'],
    ['record', 'Ардын дууны пянз', 'media', '1960-аад он', '60', 35000, 'C', 'retro-khoroolol'],
    ['denim', 'Жинсэн хүрэм', 'clothing', '1990-ээд он', '90', 120000, 'A', 'hadgalsan-tsag'],
    ['chair', 'Хилэн түшлэгтэй сандал', 'home', '1970-аад он', '70', 380000, 'B', 'hadgalsan-tsag'],
    ['jug', 'Зэс домбо, гуулин бүстэй', 'antiques', 'XX зууны эх', 'old', 420000, 'B', 'goviin-avdar'],
    ['radio', 'Модон хайрцагтай радио', 'electronics', '1960-аад он', '60', 160000, 'C', 'retro-khoroolol'],
    ['bag', 'Арьсан гар цүнх', 'accessories', '1980-аад он', '80', 145000, 'B', 'hadgalsan-tsag'],
    ['car', 'Тугалган тоглоом машин', 'toys', '1970-аад он', '70', 48000, 'C', 'hangain-huuchin'],
    ['stamps', 'Шуудангийн маркийн цомог', 'collectibles', '1960–80-аад он', '60', 95000, 'B', 'hangain-huuchin']
]

const DETAILS: Record<string, Partial<SeedProduct>> = {
    deel: {
        description:
            'Хар ногоон торгон бүстэй, тоосгон улаан ноосон дээл. Энгэр нь алтан шаргал утсаар хөвөөлсөн, гар оёдолтой. Дотор талдаа хөвөн доторлогоотой, намар болон хаврын улиралд өмсөхөд тохиромжтой.',
        grade_note: 'Урагдал, толбо, хорхойн идэлт байхгүй. Бүсний үзүүрт өнгө бага зэрэг гандсан. Худалдагч хими цэвэрлэгээнд оруулсан.',
        size: 'M · 48',
        material: 'Ноос, торго',
        color: 'Тоосгон улаан',
        measurements: [
            { label: 'Нийт урт', cm: 128 },
            { label: 'Мөрний өргөн', cm: 46 },
            { label: 'Цээж (хавтгайгаар)', cm: 54 },
            { label: 'Ханцуйн урт', cm: 62 }
        ]
    },
    chest: {
        description: 'Улаан суурьтай, алтан хээгээр будаж чимсэн модон авдар. Түгжээ нь бүтэн, дотор тал цэвэр.',
        material: 'Нарс мод, будаг',
        measurements: [
            { label: 'Өргөн', cm: 92 },
            { label: 'Гүн', cm: 48 },
            { label: 'Өндөр', cm: 56 }
        ]
    },
    camera: {
        description: 'Хальсан толин аппарат, Helios-44 линзтэй. Хөшиг, гэрэл хэмжигч ажиллаж байгаа.',
        material: 'Метал',
        measurements: [
            { label: 'Өргөн', cm: 15 },
            { label: 'Өндөр', cm: 10 }
        ]
    }
}

export const SEED_PRODUCTS: SeedProduct[] = ROWS.map(([slug, name, category, era, decade, price, grade, shop]) => ({
    slug,
    name,
    category,
    era,
    decade,
    price,
    grade,
    shop,
    description: DEFAULT_DESC,
    ...DETAILS[slug]
}))
