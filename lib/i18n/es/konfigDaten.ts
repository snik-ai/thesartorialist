// TODO übersetzen (Spanisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// English overlay of lib/konfigurator/daten.ts (IDs identical; codes and images stay there).
// Sub-group titles keep the form «Group — Variant»: the home page uses the part before « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Jacket',
      subtitle: 'The foundation of made-to-measure',
      description:
        'Hand-crafted horsehair canvas, lapel proportions, shoulder line and pocket architecture, taken directly from our tailoring specifications.',
    },
    trousers: {
      title: 'Trousers',
      subtitle: 'Clean lines and waistband details',
      description:
        'An impeccable drape of the leg, waistband closures, side adjusters and hem finishes, tailored precisely to your posture.',
    },
    waistcoat: {
      title: 'Waistcoat',
      subtitle: 'The finishing touch of the three-piece',
      description: 'Cut to sit flush over the trouser waistband, with no shirt showing in between.',
    },
    'black-tie': {
      title: 'Dinner Suit',
      subtitle: 'Eveningwear and dinner suit details',
      description: 'Formal eveningwear, strictly in keeping with the classic “Black Tie” dress code.',
    },
  },
  untergruppen: {
    // Jacket
    'jacket-front-sb': { title: 'Front — Single-breasted', subtitle: 'Fastenings for the single-breasted jacket' },
    'jacket-front-db': { title: 'Front — Double-breasted', subtitle: 'Fastenings for the double-breasted jacket' },
    'jacket-lapel-notch': { title: 'Lapel — Single-breasted, notch', subtitle: 'Measured from the roll line to the lapel point' },
    'jacket-lapel-peak': { title: 'Lapel — Single-breasted, peak', subtitle: 'Measured from the roll line to the lapel edge' },
    'jacket-lapel-shawl': { title: 'Lapel — Single-breasted, shawl collar', subtitle: 'A continuously rounded collar' },
    'jacket-lapel-db-peak': { title: 'Lapel — Double-breasted, peak', subtitle: 'Cut specifically for the double-breasted jacket' },
    'jacket-pockets': { title: 'Pockets', subtitle: 'Breast and side pockets' },
    'jacket-ticket-pocket': { title: 'Pockets — Ticket pocket', subtitle: 'Additional ticket pocket on the right' },
    'jacket-back-style': { title: 'Back & vents', subtitle: 'Back vents and drape' },
    'jacket-shoulder-style': { title: 'Shoulder', subtitle: 'Shoulder padding and sleeve head' },
    'jacket-canvas': { title: 'Canvas', subtitle: 'Floating chest canvas' },
    'jacket-lining': { title: 'Lining', subtitle: 'Extent of the cupro lining' },
    'jacket-cuff-buttons': { title: 'Sleeve buttons', subtitle: 'Number and arrangement of the buttons' },
    'jacket-cuff-style': { title: 'Arrangement of sleeve buttons', subtitle: 'Spacing of the buttons' },
    'jacket-topstitching': { title: 'Topstitching (AMF hand stitch)', subtitle: 'Hand stitching on lapels, collar and seams' },
    'jacket-lapel-buttonhole': { title: 'Lapel buttonhole', subtitle: 'Finished as an asola a mano' },
    'jacket-monogram': { title: 'Inside monogram', subtitle: 'Embroidered initials and lettering' },
    // Trousers
    'trousers-front-style': { title: 'Trouser front', subtitle: 'Pleats and front panel' },
    'trousers-front-closure': { title: 'Closure', subtitle: 'Fly and waistband fastening' },
    'trousers-waistband': { title: 'Waistband', subtitle: 'Support and waist adjustment' },
    'trousers-side-pockets': { title: 'Side pockets', subtitle: 'Cut and angle of the opening' },
    'trousers-back-pockets': { title: 'Hip pockets', subtitle: 'Arrangement of the jetted pockets' },
    'trousers-lining': { title: 'Lining', subtitle: 'Lining in the front leg' },
    'trousers-hem': { title: 'Hem', subtitle: 'Turn-up or plain hem' },
    'trousers-topstitching': { title: 'Topstitching', subtitle: 'AMF hand stitch on pocket and side seam' },
    'trousers-inside-waistband': { title: 'Inside waistband', subtitle: 'Finish of the inside waistband' },
    // Waistcoat
    'waistcoat-front-sb': { title: 'Waistcoat — Single-breasted', subtitle: 'Front and button stance' },
    'waistcoat-front-db': { title: 'Waistcoat — Double-breasted', subtitle: 'Formal, and for morning dress' },
    'waistcoat-pockets': { title: 'Pockets', subtitle: 'Jetted and welt pockets' },
    'waistcoat-back': { title: 'Back', subtitle: 'Lining or cloth back' },
    'waistcoat-topstitching': { title: 'Topstitching', subtitle: 'Hand stitching along the edges' },
    'waistcoat-buttonholes': { title: 'Buttonholes', subtitle: 'Finish of the buttonholes' },
    // Dinner suit
    'black-tie-jacket-style': { title: 'Dinner jacket', subtitle: 'In midnight blue or deep black' },
    'black-tie-facing': { title: 'Lapel', subtitle: 'Silk facing on the dinner jacket lapel' },
    'black-tie-trouser-details': { title: 'Dinner trousers: braid and waistband', subtitle: 'Silk braid and dinner waistband' },
    'black-tie-waistcoat': { title: 'Evening waistcoat', subtitle: 'A festive, low-cut waistcoat' },
  },
  optionen: {
    // Jacket — front, single-breasted
    'jacket-sb-1b': {
      label: 'One button',
      subLabel: 'Low, slender fastening',
      description: 'A modern, pared-back one-button fastening with a deep V opening.',
    },
    'jacket-sb-2b': {
      label: 'Two buttons',
      subLabel: 'The classic business standard',
      description: 'The timeless standard of Swiss gentlemen’s tailoring.',
    },
    'jacket-sb-3-2b': {
      label: 'Three-roll-two',
      subLabel: 'Soft Neapolitan roll',
      description: 'The top button disappears elegantly into the softly rolled lapel.',
    },
    'jacket-sb-3b': {
      label: 'Three buttons',
      subLabel: 'Traditionally high-buttoning',
      description: 'Traditionally British and high-buttoning, with a balanced drape.',
    },
    // Jacket — front, double-breasted
    'jacket-db-4x2': {
      label: 'Four-on-two',
      subLabel: 'A sporty, relaxed double-breasted',
      description: 'Four visible buttons, two of them to fasten.',
    },
    'jacket-db-6x2': {
      label: 'Six-on-two',
      subLabel: 'The Savile Row classic',
      description: 'A classic silhouette with six buttons, two of them to fasten.',
    },
    // Lapels
    'jacket-lapel-notch-s': {
      label: 'Slim (6.7 cm)',
      subLabel: '6.7 cm wide',
      description: 'A slender, precise notch lapel in a modern width.',
    },
    'jacket-lapel-notch-r': {
      label: 'Regular (8.0 cm)',
      subLabel: '8.0 cm wide',
      description: 'Balanced proportions, ideal with classic ties and shirt collars.',
    },
    'jacket-lapel-notch-l': {
      label: 'Wide (9.5 cm)',
      subLabel: '9.5 cm wide',
      description: 'A striking notch lapel with a strong presence across the chest.',
    },
    'jacket-lapel-peak-s': {
      label: 'Slim (6.7 cm)',
      subLabel: '6.7 cm wide',
      description: 'Upward-pointing lapel peaks that lengthen the upper body.',
    },
    'jacket-lapel-peak-r': {
      label: 'Regular (8.0 cm)',
      subLabel: '8.0 cm wide',
      description: 'A classic peak lapel in the Italian manner.',
    },
    'jacket-lapel-peak-l': {
      label: 'Wide (9.5 cm)',
      subLabel: '9.5 cm wide',
      description: 'A generous peak lapel for a commanding appearance.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Slim (4.5 cm)',
      subLabel: '4.5 cm wide',
      description: 'A slender, rounded collar for evening jackets.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Regular (6.0 cm)',
      subLabel: '6.0 cm wide',
      description: 'A continuously elegant curve for dinner jackets and velvet jackets.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Slim (9.0 cm)',
      subLabel: '9.0 cm wide',
      description: 'A slim peak lapel for the double-breasted suit.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Regular (10.0 cm)',
      subLabel: '10.0 cm wide',
      description: 'A full peak lapel for the classic elegance of the double-breasted jacket.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Wide (11.0 cm)',
      subLabel: '11.0 cm wide',
      description: 'An expressive, sweeping peak lapel.',
    },
    // Pockets
    'jacket-pocket-jetted': {
      label: 'Barchetta & jetted pocket',
      description: 'The cleanest, most formal line, entirely without flaps.',
      pocketSpec: { chest: 'Barchetta', side: 'Jetted pocket' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta & slanted jetted',
      description: 'Slanted jetted pockets that accentuate the waist.',
      pocketSpec: { chest: 'Barchetta', side: 'Slanted jetted pocket' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta & flap pocket',
      description: 'Versatile straight flap pockets; the flaps can also be tucked in.',
      pocketSpec: { chest: 'Barchetta', side: 'Flap pocket' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta & slanted flap',
      description: 'The traditional hacking cut for a dynamic waistline.',
      pocketSpec: { chest: 'Barchetta', side: 'Slanted flap pocket' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta & patch',
      description: 'A Neapolitan combination: barchetta breast pocket with rounded patch side pockets.',
      pocketSpec: { chest: 'Barchetta', side: 'Patch pocket' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Patch & patch',
      description: 'A relaxed blazer style with visible topstitching.',
      pocketSpec: { chest: 'Patch pocket', side: 'Patch pocket' },
    },
    'jacket-pocket-safari': {
      label: 'Safari & safari',
      description: 'Functional bellows pockets with a box pleat and central button fastening.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Ticket pocket
    'jacket-ticket-flap': {
      label: 'Ticket pocket with flap',
      description: 'The traditional English ticket pocket above the right flap pocket.',
      pocketSpec: { chest: 'Barchetta', side: 'Ticket pocket with flap' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Slanted ticket pocket',
      description: 'Set at the same angle as the slanted flap pocket beneath it.',
      pocketSpec: { chest: 'Barchetta', side: 'Slanted ticket pocket with flap' },
    },
    'jacket-ticket-patch': {
      label: 'Patch ticket pocket',
      description: 'A relaxed version above the right patch side pocket.',
      pocketSpec: { chest: 'Barchetta', side: 'Patch ticket pocket' },
    },
    'jacket-ticket-patch-double': {
      label: 'Patch + ticket pocket',
      description: 'Patch pockets throughout, with a small ticket pocket at the top right.',
      pocketSpec: { chest: 'Patch pocket', side: 'Patch ticket pocket' },
    },
    // Back & vents
    'jacket-back-ventless': {
      label: 'Ventless',
      subLabel: 'A smooth, uninterrupted back',
      description: 'A particularly formal, smooth back, reserved for dinner jackets and evening jackets.',
    },
    'jacket-back-single-vent': {
      label: 'Centre vent',
      subLabel: 'A single vent at the centre back',
      description: 'The traditional American centre vent.',
    },
    'jacket-back-side-vents': {
      label: 'Side vents',
      subLabel: 'Two vents at the sides',
      description: 'Drapes impeccably when seated; your hands find room in the pockets without the jacket pulling.',
    },
    // Shoulder
    'jacket-shoulder-soft': {
      label: 'Soft shoulder',
      subLabel: 'Thin padding · no sleeve-head roll · natural',
      description: 'Seams pressed inwards for a light, unstructured and natural drape.',
    },
    'jacket-shoulder-traditional': {
      label: 'Classic shoulder',
      subLabel: 'Medium padding · medium sleeve-head roll',
      description: 'Seams pressed outwards for a clean, well-groomed line across the shoulder.',
    },
    'jacket-shoulder-roped': {
      label: 'Roped shoulder',
      subLabel: 'Firm padding · pronounced sleeve-head roll · pagoda',
      description: 'Seams pressed outwards, with a distinctly raised sleeve head (con rollino).',
    },
    // Canvas
    'jacket-canvas-soft': {
      label: 'Soft canvas',
      subLabel: 'Flexible, floating horsehair chest canvas',
      description: 'A light canvas that quickly moulds to the body and is wonderfully comfortable to wear.',
    },
    'jacket-canvas-traditional': {
      label: 'Classic canvas',
      subLabel: 'Shaping, full-front horsehair canvas',
      description: 'A precise lapel roll and a clearly shaped chest that will last for decades.',
    },
    // Lining
    'jacket-lining-lined': {
      label: 'Fully lined',
      subLabel: 'Lining in body and sleeves',
      description: 'Glides effortlessly over the shirt and fully protects the interior.',
    },
    'jacket-lining-unlined': {
      label: 'Half-lined',
      subLabel: 'Lining in the sleeves and as a back yoke',
      description: 'More breathability for mild spring and autumn days.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Unlined',
      subLabel: 'Neither body nor sleeves lined',
      description: 'Maximum air circulation, with the inside seams neatly bound in tape.',
    },
    // Sleeve buttons
    'jacket-cuff-0b': {
      label: 'No buttons',
      subLabel: 'A plain, pared-back sleeve',
      description: 'A clean sleeve finish without buttonholes or buttons.',
    },
    'jacket-cuff-3b': {
      label: 'Three buttons',
      subLabel: 'Classic European',
      description: 'The traditional sleeve finish in the continental manner.',
    },
    'jacket-cuff-4b': {
      label: 'Four buttons',
      subLabel: 'The tailoring standard',
      description: 'The accepted benchmark for sleeves in fine tailoring.',
    },
    'jacket-cuff-5b': {
      label: 'Five buttons',
      subLabel: 'A Neapolitan touch',
      description: 'An unmistakable detail of fine Italian tailoring.',
    },
    'jacket-cuff-kissing': {
      label: 'Kissing buttons (overlapping)',
      subLabel: 'Buttons overlap one another (cascata)',
      description: 'A genuine hand-worked cascade on the sleeve.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Side by side',
      subLabel: 'Buttons touch without overlapping',
      description: 'A clean British row, with each button lying flat.',
    },
    // Topstitching
    'jacket-stitch-edge-2mm': {
      label: 'Edge stitch (2 mm)',
      subLabel: 'Front edge, lapels, collar and pockets',
      description: 'A fine hand stitch set 2 mm in, defining the edges and stabilising the lapel roll.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Edge stitch throughout (2 mm)',
      subLabel: 'Including darts, shoulder and back seams',
      description: 'Comprehensive hand stitching along all the key construction seams.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Raised seam (5 mm)',
      subLabel: 'Distinctive topstitching for the sports jacket',
      description: 'Pronounced topstitching set 5 mm in, ideal for textured hopsack, flannel and tweed.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Raised seams throughout (5 mm)',
      subLabel: 'Fully topstitched at 5 mm',
      description: 'Raised seams across the front, lapels, darts and all seams.',
    },
    // Lapel buttonhole
    'jacket-buttonhole-machine': {
      label: 'Machine-made',
      subLabel: 'Precise lockstitch',
      description: 'A reliable, hard-wearing machine-stitched buttonhole.',
    },
    'jacket-buttonhole-hand': {
      label: 'Hand-sewn',
      subLabel: 'Silk thread over gimp, knotted',
      description: 'Sewn by hand with genuine buttonhole silk over a gimp.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Milanese buttonhole',
      subLabel: 'Silk wrapped without knots · raised',
      description: 'The pinnacle of handwork: lustrous silk, wrapped seamlessly over a gimp.',
    },
    // Monogram
    'jacket-monogram-lined': {
      label: 'Monogram in the lining',
      subLabel: 'Embroidered below the inside breast pocket',
      description: 'Initials of your choice, embroidered by hand or machine on the lining facing.',
    },
    'jacket-monogram-unlined': {
      label: 'Monogram, unlined',
      subLabel: 'Embroidered on the pocket jetting',
      description: 'Discreetly placed on the jetting of the inside pocket, for light, unlined jackets.',
    },

    // Trousers — front
    'trousers-front-flat': {
      label: 'Flat front',
      subLabel: 'Smooth and modern',
      description: 'A smooth, clean front without pleats for a slim, elongated silhouette.',
    },
    'trousers-front-single-pleat': {
      label: 'Single pleat',
      subLabel: 'Pleat depth 2 cm',
      description: 'A little more room at the hip when seated, with a sharp crease.',
    },
    'trousers-front-double-pleat': {
      label: 'Double pleats',
      subLabel: 'First 2 cm · second 1.25 cm',
      description: 'Generous elegance with a high waist, complete freedom of movement and a beautiful drape.',
    },
    // Closure
    'trousers-closure-extended-belt': {
      label: 'Extended waistband',
      subLabel: 'Extended waistband tab',
      description: 'An extended waistband tab reaching beyond the fly for a cleaner waistline.',
    },
    'trousers-closure-standard': {
      label: 'Button fly — standard',
      subLabel: 'Fly with horn buttons',
      description: 'Traditional, purist construction; no bulging when seated, unlike a zip.',
    },
    'trousers-closure-double-belt': {
      label: 'Double waistband',
      subLabel: 'Extended fastening with two buttons',
      description: 'A high waistband with two buttons, inspired by Florentine tailoring.',
    },
    // Waistband
    'trousers-waistband-side-adjusters': {
      label: 'Side adjusters',
      subLabel: 'Brass buckles · no belt loops',
      description: 'A clean waistband with side adjuster tabs, entirely without a belt.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Belt loops',
      subLabel: 'Classic belt loops',
      description: 'Six hand-attached loops for fine leather belts.',
    },
    'trousers-waistband-plain': {
      label: 'Plain waistband',
      subLabel: 'A simple, pared-back waist',
      description: 'A pure, smooth waistband without loops or buckles, to be worn with braces.',
    },
    // Side pockets
    'trousers-pocket-slanted': {
      label: 'Slanted',
      subLabel: 'Natural entry',
      description: 'An ergonomically slanted opening; the hand slips in naturally without the cloth pulling.',
    },
    'trousers-pocket-inseam': {
      label: 'On-seam',
      subLabel: 'Concealed in the side seam',
      description: 'Invisible within the vertical side seam, for the cleanest side line.',
    },
    'trousers-pocket-jetted': {
      label: 'Jetted pocket',
      subLabel: 'Horizontal opening, double-jetted',
      description: 'A fine, double-jetted opening for formal trousers.',
    },
    'trousers-pocket-jeans': {
      label: 'Jeans pocket',
      subLabel: 'Rounded opening at the top',
      description: 'A rounded Western-style pocket, ideal for chinos and corduroy.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Frog-mouth',
      subLabel: 'Horizontal opening at the front',
      description: 'A horizontal opening at the front, as on the tailored cavalry trousers of the mid-century.',
    },
    // Hip pockets
    'trousers-back-none': {
      label: 'None',
      subLabel: 'A completely smooth back',
      description: 'Without hip pockets, for an uninterrupted, smooth drape over the seat.',
    },
    'trousers-back-left': {
      label: 'Left only',
      subLabel: 'One jetted pocket on the left',
      description: 'One jetted pocket with a horn button, on the wearer’s left.',
    },
    'trousers-back-right': {
      label: 'Right only',
      subLabel: 'One jetted pocket on the right',
      description: 'One jetted pocket with a horn button, on the wearer’s right.',
    },
    'trousers-back-two': {
      label: 'Two pockets',
      subLabel: 'Two symmetrical jetted pockets',
      description: 'Classic jetted pockets on both sides, with button fastening.',
    },
    // Lining
    'trousers-lining-unlined': {
      label: 'Unlined',
      subLabel: 'Pure cloth, breathable',
      description: 'With no lining at all, for maximum breathability on warm days.',
    },
    'trousers-lining-half-lined': {
      label: 'Half-lined',
      subLabel: 'Lined at the front to below the knee',
      description: 'Smooth cupro lining above the knee prevents friction and baggy knees.',
    },
    'trousers-lining-fully-lined': {
      label: 'Fully lined',
      subLabel: 'Lined along the full length',
      description: 'A complete lining, comfortable for sensitive skin and heavy wool cloths.',
    },
    // Hem
    'trousers-hem-plain-bottom': {
      label: 'Plain hem',
      subLabel: 'Slightly sloped towards the back',
      description: 'A clean, straight finish, cut a little longer at the back towards the heel.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Turn-up (3.0 cm)',
      subLabel: 'A discreet turn-up',
      description: 'An understated turn-up that gives the trouser leg a gentle weight.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Turn-up (3.5 cm)',
      subLabel: 'A balanced turn-up',
      description: 'Balanced proportions, ideal for men of average height.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Turn-up (4.0 cm)',
      subLabel: 'The classic tailoring width',
      description: 'The proven standard of fine tailoring, for an ideal drape and a crisp crease.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Turn-up (4.5 cm)',
      subLabel: 'A bold turn-up',
      description: 'A striking turn-up for heavier wool cloths and flannel.',
    },
    // Topstitching
    'trousers-topstitching-none': {
      label: 'None',
      subLabel: 'AMF hand stitch on the side pocket only',
      description: 'A discreet AMF stitch, limited to the edge of the side pocket.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Edge stitch (2 mm)',
      subLabel: '2 mm AMF on pockets and side seam',
      description: 'A hand-stitched look set 2 mm in, running all the way down the outer side seam.',
    },
    // Inside waistband
    'trousers-inside-wb-pleated': {
      label: 'Pleated waistband',
      subLabel: 'Classic curtained inside waistband',
      description: 'A traditional pleated inside waistband for comfort and flexibility.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Pleats + braces buttons',
      subLabel: 'Inside horn buttons for braces',
      description: 'A pleated inside waistband with six inside horn buttons for button-on braces.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Waistband with shirt grip',
      subLabel: 'Rubberised gripper tape',
      description: 'An integrated rubberised gripper tape keeps the shirt neatly tucked in all day.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Shirt grip + braces buttons',
      subLabel: 'Gripper tape and braces buttons',
      description: 'The ultimate in comfort: gripper tape and buttons for braces combined.',
    },

    // Waistcoat — single-breasted
    'waistcoat-sb-4b': {
      label: 'Four buttons',
      subLabel: 'Low opening',
      description: 'Buttoned low, showing more of the tie and shirt front.',
    },
    'waistcoat-sb-5b': {
      label: 'Five buttons',
      subLabel: 'The classic waistcoat',
      description: 'The classic European waistcoat for the three-piece suit, with a balanced button stance.',
    },
    'waistcoat-sb-6b': {
      label: 'Six buttons',
      subLabel: 'High-buttoning',
      description: 'A high fastening; by time-honoured rule the bottom button is left undone.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Horseshoe',
      subLabel: 'Low U-shaped opening, formal',
      description: 'A shaped U opening that shows off a pleated dress shirt and bow tie.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Notch lapel',
      subLabel: 'Classic lapel collar',
      description: 'Gives the neck and shoulders structure and a handsome frame.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Shawl collar',
      subLabel: 'Softly rounded collar',
      description: 'A softly, continuously rounded collar, as on historic evening waistcoats.',
    },
    // Waistcoat — double-breasted
    'waistcoat-db-6b': {
      label: 'Double-breasted, six buttons',
      subLabel: 'Straight hem',
      description: 'A stately double-breasted cut with a straight, horizontal lower edge.',
    },
    'waistcoat-db-8b': {
      label: 'Double-breasted, eight buttons',
      subLabel: 'High-closing, formal',
      description: 'High-closing, for morning dress or a commanding three-piece appearance.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Double-breasted, shawl collar',
      subLabel: 'Continuously rounded collar',
      description: 'Double-breasted with a sweeping shawl collar.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Double-breasted, notch lapel',
      subLabel: 'Notched lapel collar',
      description: 'A double-breasted waistcoat with a crisply cut notch lapel.',
    },
    // Waistcoat — pockets
    'waistcoat-pocket-jetted': {
      label: 'Jetted pockets',
      subLabel: 'Two fine jetted pockets',
      description: 'Particularly flat, double-jetted pockets for a razor-sharp waistline.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 welt pockets',
      subLabel: 'Two classic welt pockets',
      description: 'Classic lower welt pockets.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 welt pockets',
      subLabel: 'Two above, two below',
      description: 'Four welt pockets, with room for a pocket watch and watch chain.',
    },
    // Waistcoat — back
    'waistcoat-back-cloth': {
      label: 'Cloth back',
      subLabel: 'Suit cloth front and back',
      description: 'Can be worn in style without a jacket as a waistcoat in its own right.',
    },
    'waistcoat-back-lining': {
      label: 'Lining back',
      subLabel: 'Breathable cupro back',
      description: 'A smooth cupro back over which the jacket glides effortlessly.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Lining + back strap',
      subLabel: 'Cupro back with buckle strap',
      description: 'The strap at the back allows the finest adjustment for a precisely tailored silhouette.',
    },
    // Waistcoat — topstitching
    'waistcoat-topstitching-none': {
      label: 'None',
      subLabel: 'Clean edges without stitching',
      description: 'Formal simplicity with no visible topstitching.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Edge stitch (2 mm)',
      subLabel: '2 mm AMF hand stitch along the edges',
      description: 'A fine hand stitch set 2 mm in, defining the front edge and collar roll.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Raised seam (5 mm)',
      subLabel: 'Distinctive 5 mm topstitching',
      description: 'Pronounced topstitching, ideal for tweed and sporty wool cloths.',
    },
    // Waistcoat — buttonholes
    'waistcoat-buttonhole-none': {
      label: 'None',
      subLabel: 'No decorative lapel buttonhole',
      description: 'A clean lapel edge without a decorative buttonhole.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'Machine-made',
      subLabel: 'Precise lockstitch',
      description: 'A neat, even and very hard-wearing machine-made buttonhole.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Hand-sewn',
      subLabel: 'Hand-worked buttonholes',
      description: 'Worked by hand in pure silk thread over a gimp.',
    },

    // Dinner suit — jacket
    'black-tie-tux-shawl': {
      label: 'Dinner jacket with shawl collar',
      subLabel: 'Rounded silk lapel · one button',
      description: 'A continuously rounded silk collar with a single covered button.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Single-breasted, peak lapel',
      subLabel: 'Upward-pointing silk lapel',
      description: 'An expressive, wide peak lapel with a fine silk facing.',
    },
    'black-tie-tux-peak-db': {
      label: 'Double-breasted dinner jacket',
      subLabel: 'Six-on-two buttons, with silk lapels',
      description: 'Worn fastened, without cummerbund or waistcoat.',
    },
    // Dinner suit — facing
    'black-tie-facing-satin': {
      label: 'Satin',
      subLabel: 'Lustrous silk satin on lapels and buttons',
      description: 'High-shine pure silk that catches the candlelight and the sparkle of the chandeliers.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Grosgrain',
      subLabel: 'Matt ribbed silk on lapels and buttons',
      description: 'Finely ribbed silk for understated evening elegance with depth and texture.',
    },
    // Dinner suit — trousers
    'black-tie-trousers-braid': {
      label: 'Silk braid',
      subLabel: 'A matching silk stripe along the side seam',
      description: 'A vertical satin or grosgrain braid over the outer side seam.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Silk braid — front view',
      subLabel: 'The full front with braid',
      description: 'Seen from the front, with a clean drape throughout.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Dinner waistband',
      subLabel: 'Silk-faced waistband without belt loops',
      description: 'Faced with matching silk, with inside braces buttons.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Dinner waistband — front view',
      subLabel: 'A smooth front like a cummerbund',
      description: 'A seamless front fastening that sits flush beneath the dinner jacket.',
    },
    // Dinner suit — waistcoat
    'black-tie-horseshoe': {
      label: 'Horseshoe evening waistcoat',
      subLabel: 'Low opening that shows the shirt front',
      description: 'The traditional low horseshoe opening for formal eveningwear.',
    },
  },
};
