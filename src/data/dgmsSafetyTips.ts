export interface DGMSSafetyTip {
  id: string;
  circularRef: string;
  regRef: string;
  category: 'HEMM Operations' | 'Dumping & Pit Safety' | 'Mine Slope Stability' | 'Equipment Maintenance' | 'Night Shift & Electrical' | 'Crusher & Plant Safety' | 'Monsoon & Wet Operations' | 'Occupational Health';
  title: string;
  tipSummary: string;
  detailedGuideline: string;
  shiftFocus: string;
  actionItems: string[];
  mandatoryPPE: string[];
  severity: 'CRITICAL' | 'MANDATORY' | 'STATUTORY';
}

export const DGMS_SAFETY_TIPS: DGMSSafetyTip[] = [
  {
    id: 'TIP-DGMS-01',
    circularRef: 'DGMS (Tech) Circular No. 04 of 2020',
    regRef: 'MMR 1961 Regulation 181',
    category: 'HEMM Operations',
    title: 'HEMM Proximity Warning & Blind Spot Verification Protocol',
    tipSummary: 'Rear cameras, ultrasonic sensors, and audio-visual alarms must be tested prior to starting 100T dumpers. Always adhere to the 1-2-3 horn protocol with a 10-second wait before movement.',
    detailedGuideline: 'DGMS technical circular mandates that all heavy earth moving machinery operating in opencast benches have functional blind spot cameras and proximity detection systems. Blind spot zones around BEML BH-100S dumpers can extend up to 15 meters to the rear and 6 meters to the blind left front.',
    shiftFocus: 'Pit-1 & Pit-2 Active Haul Roads · All Shifts',
    actionItems: [
      'Test functional audio-visual alarm (AVA) and rear display before leaving parking bay.',
      'Sound horn once to start engine, twice for forward drive, three times for reverse.',
      'Maintain minimum 30-meter following distance behind heavy dumpers on haul gradients.',
      'Light motor vehicles (LMVs) must maintain high-visibility spring poles with flashing beacons.',
    ],
    mandatoryPPE: ['Safety Helmet', 'High-Vis Reflective Vest (Class 3)', 'Steel-Toe Boots'],
    severity: 'CRITICAL',
  },
  {
    id: 'TIP-DGMS-02',
    circularRef: 'DGMS Circular No. 02 of 2017',
    regRef: 'MMR 1961 Regulation 108',
    category: 'Dumping & Pit Safety',
    title: 'Waste Dump Safety Berm Height & Spotter Control at Crest',
    tipSummary: 'Safety berms at dumping crests must equal or exceed tyre radius of largest dumper (1.8m for BH-100S). Never dump material without an authorized spotter with reflective baton.',
    detailedGuideline: 'Dump edge failures remain a leading cause of machinery rollover accidents. Berms must be constructed of competent rock. Dumpers must stop 5 meters short of soft crests, discharge payload on firm footing, and allow dozers to push rock over the edge.',
    shiftFocus: 'South Waste Dump & Screening Plant Stockpiles · Shift A & B',
    actionItems: [
      'Measure berm height at dump crest; minimum 1.8m required before dumper positioning.',
      'Spotter must maintain eye contact with driver in driver-side mirror at all times.',
      'Immediately halt dumping if tension cracks develop parallel to the crest line.',
      'Ensure wheel stops are provided for night dumping operations.',
    ],
    mandatoryPPE: ['Reflective Baton (Spotters)', 'Steel-Toe Boots', 'Safety Helmet'],
    severity: 'CRITICAL',
  },
  {
    id: 'TIP-DGMS-03',
    circularRef: 'DGMS Circular No. 09 of 2008',
    regRef: 'MMR 1961 Regulation 106',
    category: 'Mine Slope Stability',
    title: 'Bench Geometry & Overhang Prevention on Quarry Faces',
    tipSummary: 'Bench height must not exceed the shovel maximum digging depth. Bench floor width must be at least bench height plus width of the widest machine operating on the bench.',
    detailedGuideline: 'Face collapses during excavation cause catastrophic machinery entrapment. All quarry benches must maintain established overall slope angles approved by the DGMS Director of Mines Safety. Overhangs and loose boulders must be dressed down before deploying loaders.',
    shiftFocus: 'Donimalai Quarry Pit Bench 825m & 810m · Morning Shift',
    actionItems: [
      'Inspect upper bench crest for loose boulders or overhangs before positioning excavators.',
      'Ensure bench floor is graded and crowned to channel surface runoff to perimeter drains.',
      'Never allow drilling directly adjacent to an uninspected blast boundary face.',
      'Notify Mining Geologist immediately if strata displacement or rock slip is detected.',
    ],
    mandatoryPPE: ['Safety Helmet with Chin Strap', 'Safety Goggles', 'Safety Boots'],
    severity: 'MANDATORY',
  },
  {
    id: 'TIP-DGMS-04',
    circularRef: 'DGMS Circular No. 01 of 2011',
    regRef: 'MVT Rules 1966 Rule 9 & Form B',
    category: 'Equipment Maintenance',
    title: 'Mandatory 360° Walkaround & Fail-Safe Emergency Brake Test',
    tipSummary: 'Every HEMM operator must complete a 360-degree walkaround inspection before turning ignition. Test service brakes, retarder, and emergency parking brake on level ground.',
    detailedGuideline: 'Brake failure on mine gradients is catastrophic. Accumulator pressure and secondary emergency brake circuits must be verified before hauling full ore loads down Donimalai ramp gradients.',
    shiftFocus: 'Central Heavy Workshop & Pre-Start Bays · All Shifts',
    actionItems: [
      'Inspect wheel rim wedges, tyre cuts, and inflation pressure before boarding cab.',
      'Check auto fire suppression system (AFSS) nitrogen pressure cylinder gauge.',
      'Verify that steering accumulator holds emergency pressure for minimum 3 cycles with engine off.',
      'Sign daily operator log book; report hydraulic fluid seepages immediately to workshop.',
    ],
    mandatoryPPE: ['Hi-Vis Vest', 'Ear Protection', 'Steel-Toe Boots'],
    severity: 'STATUTORY',
  },
  {
    id: 'TIP-DGMS-05',
    circularRef: 'DGMS (Tech) Circular No. 03 of 2019',
    regRef: 'MMR 1961 Regulation 148',
    category: 'Night Shift & Electrical',
    title: 'Haul Road Illumination & Anti-Glare Alignment for Night Shifts',
    tipSummary: 'Minimum 10 lux horizontal illumination is statutory on haul roads and 30 lux at active faces. High-mast lights must angle 45° downward to eliminate operator glare.',
    detailedGuideline: 'Poor illumination and glare create fatigue and collision risk during night shifts. All fixed lighting towers along Donimalai haul roads must be aligned to illuminate the roadway without blinding approaching dumper operators.',
    shiftFocus: 'Night Operations · Shift C (22:00 - 06:00)',
    actionItems: [
      'Clean cabin windscreens and headlights with washer fluid before commencing night shift.',
      'Check illumination lux levels at transfer points and crushing hopper using light meter.',
      'Report flickering floodlights or dark zones on primary haul ramps to Electrical Dept.',
      'All personnel on foot must carry intrinsically safe LED flashlights and reflective vests.',
    ],
    mandatoryPPE: ['Retro-Reflective Jacket', 'Safety Helmet with Lamp Bracket', 'Safety Boots'],
    severity: 'MANDATORY',
  },
  {
    id: 'TIP-DGMS-06',
    circularRef: 'DGMS Circular No. 08 of 2014',
    regRef: 'CEA Regulations 2010 Reg. 30',
    category: 'Crusher & Plant Safety',
    title: 'Lockout / Tagout (LOTO) & Energy Isolation on Conveyors & Crushers',
    tipSummary: 'Zero-energy isolation is compulsory before maintenance on primary gyratory crusher, screen decks, and conveyors. Individual personal padlocks must be affixed to isolators.',
    detailedGuideline: 'Pull-cord safety switches and local stop buttons are emergency devices, not isolation points. Zero-energy state must be proven with a test start attempt and multimeter check before entry into chutes or transfer points.',
    shiftFocus: 'Donimalai Ore Processing Plant & Secondary Screening · Shift B Maintenance',
    actionItems: [
      'Every technician working on machinery must install their own lock and danger tag.',
      'Verify gravity counterweights are mechanically wedged and locked before belt work.',
      'Test start button locally to verify complete electrical and hydraulic isolation.',
      'Never remove another technician’s padlock without formal Shift Engineer permit.',
    ],
    mandatoryPPE: ['Lockout Padlock & Hasps', 'Safety Harness (for chutes)', 'Cut-Resistant Gloves'],
    severity: 'CRITICAL',
  },
  {
    id: 'TIP-DGMS-07',
    circularRef: 'DGMS Circular No. 05 of 2021',
    regRef: 'DGMS Standing Order on Monsoon Safety',
    category: 'Monsoon & Wet Operations',
    title: 'Wet Ramp Speed Restrictions & Haul Road Drainage Precautions',
    tipSummary: 'Under wet or rainy conditions, dumper speeds must not exceed 15 km/h on ramps. Maximum ramp gradient is 1 in 16. Inspect road culverts and sump dewatering pumps daily.',
    detailedGuideline: 'Wet laterite and iron ore mud drastically reduce tyre adhesion. Sudden braking on wet ramps causes jackknifing or skidding. Hydrotarder and auxiliary braking must be engaged before entering downward slopes.',
    shiftFocus: 'Main Decline Ramp & Pit Drainage Channels · Monsoon Advisory',
    actionItems: [
      'Select lowest gear and engage retarder prior to cresting downhill slopes.',
      'Increase following distance to minimum 50 meters between loaded dumpers in wet conditions.',
      'Inspect catch water drains along upper hill slopes to prevent torrent overflow into pit.',
      'Test high-capacity sump dewatering pumps and emergency standby generator sets.',
    ],
    mandatoryPPE: ['Waterproof Hi-Vis Rainwear', 'Slip-Resistant Nitrile-Sole Boots', 'Safety Helmet'],
    severity: 'STATUTORY',
  },
  {
    id: 'TIP-DGMS-08',
    circularRef: 'DGMS Circular No. 06 of 2016',
    regRef: 'Mines Act 1952 Section 22A',
    category: 'Occupational Health',
    title: 'Airborne Respirable Dust Control & Wet Blast Hole Drilling',
    tipSummary: 'Dry drilling without operational dust extractors or water injection is strictly prohibited. Pressurized water tankers must spray haul roads at regular intervals.',
    detailedGuideline: 'Inhalation of free silica and respirable iron ore dust causes pneumoconiosis and chronic lung disease. Wet drilling and continuous water suppression at transfer chutes are statutory conditions under DGMS mine safety guidelines.',
    shiftFocus: 'Pit-1 Drilling Benches & Crushing Hoppers · Shifts A & B',
    actionItems: [
      'Ensure water mist injection or cyclone dust collector on Epiroc IDM-45 drill is functional.',
      'Operate pressurized water bowser on haul road before haulage cycle creates dust clouds.',
      'Maintain positive pressure in air-conditioned operator cabs; replace cabin HEPA filters regularly.',
      'Wear approved N95 / FFP2 particulate respirators when working in crusher dry zones.',
    ],
    mandatoryPPE: ['N95 Particulate Respirator', 'Safety Goggles', 'Ear Defenders'],
    severity: 'MANDATORY',
  },
];
