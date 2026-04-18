import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { parse } from "https://esm.sh/csv-parse@5.5.3/sync";

const GENDER_PLACEHOLDERS = ['no data', 'n/a', 'na', 'none', 'unknown', '-', ''];

/**
 * Extracts a candidate country name from the filename.
 * Pattern: "... [Country] Masterlist ..."
 */
function extractCountryFromFilename(filename: string): string | null {
    const cleanName = filename.split('/').pop() || filename;
    const match = cleanName.match(/Lifewood\s*x\s*(?:BYU|Republic of the Congo|Democratic Republic of Congo)?\s*([^(]*?)\s*Masterlist/i);
    if (match && match[1]) return match[1].trim();
    return null;
}

function guessGender(name: string): 'Male' | 'Female' {
    if (!name) return 'Male';
    const normalized = name.trim().toLowerCase().split(/[\s-]/)[0];
    
    const maleExceptions = ['joshua', 'ezra', 'luca', 'noa', 'elijah', 'isaiah', 'jeremiah', 'jonah', 'micah', 'hoshea', 'andrea', 'nikita'];
    if (maleExceptions.includes(normalized)) return 'Male';
    
    const maleNames = [
        'michael', 'christian', 'david', 'joseph', 'daniel', 'james', 'ronald', 'richard', 
        'robert', 'william', 'kevin', 'jason', 'john', 'mark', 'paul', 'jay', 'peter', 
        'ryan', 'ian', 'eric', 'aaron', 'gabriel', 'francis', 'anthony', 'andrew', 
        'vincent', 'patrick', 'kenneth', 'steven', 'edward', 'brian', 'george', 
        'matthew', 'charles', 'bryan', 'jeffrey', 'jeremy', 'stephen', 'dennis',
        'carl', 'louis', 'raymond', 'justin', 'victor', 'albert', 'alvin', 'rodel',
        'ronel', 'rommel', 'ramil', 'roel', 'rolando', 'romeo', 'renato', 'ricky',
        'rico', 'renel', 'roderick', 'rodrigo', 'erwin', 'arnel', 'arjun', 'aron',
        'ben', 'benjamin', 'renz', 'ken', 'kurt', 'hans', 'jan', 'jansen', 'janssen',
        'jayson', 'jeoff', 'jeff', 'jerome', 'jess', 'jesus', 'jim', 'joel', 'joey',
        'jonathan', 'jorge', 'jose', 'juan', 'julius', 'jun',
        'melvin', 'mike', 'neil', 'noel', 'noli', 'norbert', 'oliver', 'oscar',
        'ramel', 'randy', 'raul', 'reymund', 'reymart',
        'rob', 'robbie', 'romil', 'samuel', 'sean', 'sherwin', 'simon', 'sonny',
        'terence', 'terrence', 'theo', 'theodore', 'tom', 'tommy', 'tony', 'ulysses',
        'warren', 'wayne', 'will', 'wilson', 'xavier', 'zeus', 'aldrin', 'alex',
        'alfredo', 'aljun', 'allen', 'almer', 'amado', 'andrei',
        'kwame', 'kofi', 'kojo', 'kweku', 'kwabena', 'kwasi', 'yaw', 'ebo',
        'fiifi', 'nana', 'nii', 'ato', 'kosi', 'kafui', 'selorm', 'edem',
        'emmanuel', 'ernest', 'frank', 'fred', 'godfred', 'henry',
        'isaac', 'jacob', 'joachim', 'joe', 'kingsley',
        'larry', 'nathaniel', 'nicholas', 'prince', 'ralph', 'solomon',
        'hery', 'tojo', 'fidy', 'toky', 'niry', 'mamy', 'tsiry',
        'haja', 'tahina', 'zo', 'faneva', 'hasina', 'feno',
        'lanto', 'meva', 'njaka', 'nirina', 'rakoto', 'ravo', 'sitraka',
        'tiandraza', 'tsilavina', 'tsimihary', 'vonjy', 'willy',
        'kondwani', 'chimwemwe', 'chisomo', 'mphatso', 'blessings', 'takondwa',
        'innocent', 'bright', 'lucky', 'felix', 'gift', 'wisdom',
        'yankho', 'tawonga', 'madalitso', 'mchenga', 'khumbo', 'dalitso',
        'abel', 'moses', 'elias', 'alfred', 'christopher',
        'sipho', 'thabo', 'lungelo', 'sibusiso', 'sifiso', 'siyabonga',
        'sandile', 'nkosinathi', 'mthokozisi', 'bongani', 'mlungisi', 'sakhile',
        'lungisa', 'mandla', 'njabulo', 'nhlanhla', 'vusi', 'themba', 'lebo',
        'mpho', 'tshepiso', 'kgomotso', 'karabo', 'lesego', 'kabelo', 'refilwe',
        'pieter', 'hendrik', 'christiaan', 'francois', 'deon', 'gerrit',
        'siosaia', 'taufa', 'fifita', 'toni', 'sione', 'peni',
        'tevita', 'semisi', 'sitiveni', 'filipe', 'lisiate', 'viliami',
        'lose', 'latu', 'soakai', 'pohiva', 'tupou', 'fetu', 'manase', 'mosese', 'nuku', 'uili',
        'museveni', 'achola', 'byaruhanga', 'ddungu', 'godfrey', 'hamidu',
        'ibanda', 'jamil', 'kagiso', 'kalule', 'kamya',
        'kato', 'kiiza', 'kimuli', 'kizza', 'lubega', 'luyimbazi',
        'matovu', 'mugisha', 'mukasa', 'mulindwa', 'mutebi', 'muwonge',
        'mwanje', 'nsubuga', 'ntambi', 'ochieng', 'odongo', 'okello',
        'okot', 'omara', 'onen', 'opoka', 'oryem', 'otim', 'otto',
        'ssali', 'ssebulime', 'tumusiime', 'wasswa', 'wycliffe',
        // Republic of the Congo (Brazzaville)
        'achille', 'adolphe', 'aimé', 'alain', 'arsene', 'baudouin', 'brice',
        'cédric', 'christian', 'claude', 'clément', 'damien', 'didier', 'dieudonné',
        'edgard', 'edouard', 'emile', 'etienne', 'euphrase', 'fernand', 'firmin',
        'florentin', 'gaston', 'gervais', 'gilbert', 'gustave', 'hervé', 'hilaire',
        'honoré', 'hubert', 'joël', 'julien', 'justin', 'landry', 'léon', 'léopold',
        'luc', 'lucas', 'lucien', 'marius', 'mathurin', 'maxime', 'médard',
        'modeste', 'norbert', 'parfait', 'pascal', 'patrice', 'philippe', 'pierre',
        'prosper', 'raphaël', 'régis', 'rené', 'richard', 'rodrigue', 'rolland',
        'romain', 'serge', 'séverin', 'sosthène', 'sylvain', 'théodore', 'thierry',
        'timothée', 'toussaint', 'ulrich', 'valentin', 'venant', 'xavier', 'yves'
    ];
    if (maleNames.includes(normalized)) return 'Male';
    
    const femaleNames = [
        'mary', 'jane', 'sarah', 'karen', 'michelle', 'jennifer', 'rachel', 'ruth', 
        'naomi', 'maria', 'anna', 'kristine', 'joan', 'joy', 'princess', 'angel', 
        'grace', 'hazel', 'carmel', 'isabel', 'maricel', 'liezel', 'april', 'cheryl',
        'sharon', 'diane', 'helen', 'carol', 'abigail', 'miriam', 'esther', 'marianne',
        'rowena', 'mylene', 'myleen', 'noreen', 'norma', 'nora', 'rosario', 'rose',
        'roselyn', 'rosalyn', 'cristina', 'mae', 'bea', 'bianca', 'carmela', 'cecile',
        'claire', 'clarissa', 'claudia', 'crystal', 'danica', 'darlene',
        'denise', 'desiree', 'dina', 'edna', 'elaine', 'elena', 'elisa', 'eliza',
        'ella', 'emily', 'emma', 'eva', 'faith', 'female', 'fiona', 'florence',
        'gina', 'glenda', 'gloria', 'irene', 'iris', 'ivy', 'jacqueline', 'jennie',
        'jessica', 'jocelyn', 'josephine', 'joanna', 'judy', 'julia',
        'kathleen', 'katrina', 'kim', 'laura', 'lea', 'lily', 'linda',
        'lisa', 'liza', 'lorna', 'lorraine', 'lucia', 'lucy', 'lyka', 'lynda',
        'lyra', 'mabel', 'margaret', 'marlene', 'marta', 'melody', 'nina',
        'olive', 'olivia', 'pamela', 'patricia', 'pearl', 'petra', 'pia',
        'rebecca', 'rena', 'rhea', 'rina', 'roxanne', 'ruby', 'sabrina',
        'sandra', 'sasha', 'selena', 'sheila', 'sherry', 'sofia',
        'stella', 'sue', 'susan', 'suzanne', 'tatiana', 'theresa', 'tina',
        'vera', 'vicki', 'victoria', 'vivian', 'wanda', 'wendy', 'yolanda', 'zoe',
        'ama', 'akua', 'abena', 'adwoa', 'afia', 'efua', 'araba',
        'adjoa', 'akosua', 'maame', 'adoma', 'afua', 'esi', 'ewurama',
        'gifty', 'patience', 'comfort', 'mercy', 'benedicta', 'celestine',
        'charity', 'christiana', 'doris', 'edith', 'elizabeth', 'emelia', 'faustina',
        'gertrude', 'gladys', 'harriet', 'hilda', 'joycelyn', 'judith', 'justina',
        'lydia', 'magdalene', 'martha', 'matilda', 'millicent', 'perpetua', 'philomena',
        'priscilla', 'rosemond', 'simplicia', 'theodosia', 'veronica', 'vivienne',
        'volatiana', 'haingonirina', 'miora', 'njaratiana', 'lalaina',
        'voahangy', 'fanja', 'haivo', 'landy', 'mahefa', 'mialisoa',
        'mialy', 'nadine', 'narindra', 'noro', 'ony', 'onjanirina',
        'phara', 'rindra', 'rojoniaina', 'sarobidy', 'soavina',
        'tantely', 'tsanta', 'valisoa', 'vatosoa', 'vetarisoa',
        'tadala', 'thandeka', 'thandiwe', 'chifundo', 'chikondi',
        'lusungu', 'limbani', 'luwiza', 'agatha', 'agnes', 'alice',
        'beatrice', 'bertha', 'cecilia', 'clara', 'dorcas',
        'eunice', 'evelyn', 'lindiwe', 'memory', 'monica', 'violet',
        'nomvula', 'nosipho', 'nompumelelo', 'nozipho', 'nokwanda', 'nokuthula',
        'nonhlanhla', 'nompilo', 'nothando', 'nomthandazo', 'nokubonga',
        'zanele', 'zodwa', 'zandile', 'zintle', 'zinhle', 'ziyanda',
        'ayanda', 'asanda', 'anele', 'amahle', 'andile', 'akhona',
        'bongiwe', 'busisiwe', 'buhle', 'bathabile', 'boitumelo',
        'dineo', 'dintle', 'duduzile', 'khanyisile', 'lerato',
        'lungile', 'mamello', 'nandi', 'nolwazi', 'nomsa', 'ntombizodwa',
        'phindile', 'sibongile', 'simangele', 'thandi', 'thandeka',
        'yolanda', 'wilhelmina', 'antoinette', 'charmaine', 'charlene',
        'salote', 'luseane', 'lupe', 'mele', 'selai', 'sela', 'nau',
        'finau', 'kalisi', 'lesieli', 'lineti', 'longi', 'lotu',
        'malia', 'melenaite', 'moana', 'natalia', 'ofa', 'paea',
        'seini', 'silia', 'sina', 'unaisi',
        'akello', 'akite', 'akullo', 'alero', 'apio', 'atim', 'ayot',
        'ayuma', 'chelimo', 'chemutai', 'cherop', 'cheptoo', 'among',
        'aber', 'adong', 'ajok', 'akech', 'akidi', 'akot', 'akumu',
        'birungi', 'byakagaba', 'imelda', 'immaculate', 'jacinta',
        'jovia', 'juliet', 'justine', 'ketty', 'kyomugisha',
        'mbabazi', 'milly', 'nakato', 'nakafeero', 'nakiganda',
        'nakimuli', 'nakiranda', 'nakiyingi', 'namazzi', 'namukasa',
        'nampijja', 'nansubuga', 'nanteza', 'naome', 'nassuna',
        'natukunda', 'nayiga', 'nkirote', 'norah', 'robinah', 'scovia', 'tendo', 'topista', 'winnie',
        // Republic of the Congo (Brazzaville)
        'adrienne', 'albertine', 'angélique', 'antoinette', 'arlette', 'armelle',
        'bernadette', 'brigitte', 'célestine', 'chantal', 'christelle', 'claudette',
        'clémence', 'corinne', 'delphine', 'désirée', 'élisabeth', 'élise', 'emilienne',
        'estelle', 'eugénie', 'éveline', 'fabienne', 'félicité', 'fernande', 'flore',
        'françoise', 'geneviève', 'georgette', 'gilberte', 'ginette', 'huguette',
        'jacqueline', 'jeanne', 'jocelyne', 'joséphine', 'laurence', 'léonie', 'liliane',
        'lucie', 'madeleine', 'marguerite', 'marthe', 'martine', 'mireille', 'monique',
        'nathalie', 'nicole', 'odette', 'paulette', 'pauline', 'rachelle', 'régine',
        'rolande', 'rosalie', 'roseline', 'simone', 'solange', 'sophie', 'suzanne',
        'sylvie', 'thérèse', 'valérie', 'véronique', 'victoire', 'viviane'
    ];
    if (femaleNames.includes(normalized)) return 'Female';
    
    const femaleSuffixes = [
        'lyn', 'line', 'mae', 'ann', 'anne', 'marie', 'beth', 'icel', 'elle', 
        'ice', 'ine', 'ette', 'ita', 'ina', 'isa', 'ela', 'ica', 'yza', 'iza',
        'issa', 'essa', 'zia', 'cia', 'nia', 'mia', 'lia', 'sia', 'lla', 'yla'
    ];
    for (const suffix of femaleSuffixes) {
        if (normalized.endsWith(suffix) && normalized.length > 3) return 'Female';
    }
    
    const maleSuffixes = [
        'son', 'bert', 'ward', 'ard', 'ron', 'dan', 'ick', 'rick', 
        'ton', 'don', 'mon', 'vin', 'iel', 'uel', 'ell', 'ald', 'old', 'rey', 'roy',
        'oy', 'ler', 'ner', 'ger', 'fer', 'ter', 'ver'
    ];
    for (const suffix of maleSuffixes) {
        if (normalized.endsWith(suffix) && normalized.length > 3) return 'Male';
    }
    
    if (normalized.endsWith('a') && normalized.length > 3) return 'Female';
    
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const lastChar = normalized[normalized.length - 1];
    if (!vowels.includes(lastChar)) return 'Male';
    if (lastChar === 'o' || lastChar === 'i') return 'Male';
    
    return 'Female';
}

function findHeaderIndex(headers: string[], possibleNames: string[], skipCount = 0): number {
    let skipped = 0;
    for (let i = 0; i < headers.length; i++) {
        const h = String(headers[i]).trim().toLowerCase();
        if (possibleNames.some(p => h.includes(p.toLowerCase()))) {
            if (skipped === skipCount) return i;
            skipped++;
        }
    }
    return -1;
}

function parseAge(val: any): number | null {
    if (!val) return null;
    const s = String(val);
    const m = s.match(/(\d{1,2})/);
    if (m) {
        const num = Number(m[1]);
        if (num >= 5 && num <= 100) return num;
    }
    return null;
}

function normalizeAffiliation(raw: string | null | undefined): string {
    if (!raw) return 'Participant';
    const v = raw.trim().toLowerCase();
    if (v.includes('church')) return 'Church Member';
    if (v.includes('student') || v.includes('scholar')) return 'Student';
    if (v.includes('referral')) return 'Referral';
    if (v.includes('pef')) return 'PEF';
    if (v.includes('all of the above')) return 'All of the Above';
    if (v.includes('voice') || v.includes('audio') || v.includes('recording') || v.includes('speech')) return 'Voice Recording';
    if (v.includes('image') || v.includes('photo') || v.includes('capture') || v.includes('capturing') || v.includes('gemini')) return 'Image Collection';
    if (v.includes('video') || v.includes('model')) return 'Video Data';
    if (v.includes('data collect')) return 'Data Collector';
    if (v.includes('annotator') || v.includes('annotation')) return 'Annotator';
    if (v.includes('genealogy') || v.includes('family')) return 'Genealogy';
    if (v.includes('leader') || v.includes('session')) return 'Session Leader';
    if (v.includes('iphone') || v.includes('face') || v.includes('facial')) return 'Face/iPhone Data';
    if (v.includes('short') || v.includes('story') || v.includes('narrative')) return 'Short Story';
    if (v.includes('participant')) return 'Participant';
    return raw.trim().length > 30 ? 'Other' : raw.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    let requestedPath: string | null = null;
    
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            requestedPath = body.path || (body.country && body.country.includes('.csv') ? body.country : null);
        } catch (e) {}
    }

    const filename = requestedPath || 'Lifewood x BYU Philippines Masterlist (2025-2026)(Masterlist).csv';
    const candidateCountry = extractCountryFromFilename(filename);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseClient.storage
        .from('Data')
        .download(filename);

    if (error) throw new Error(`Could not download ${filename}: ${error.message}`);

    const text = await data.text();
    const records = parse(text, { skip_empty_lines: true });
    
    let rows = records;
    let headers: string[] = [];
    
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(records.length, 10); i++) {
        const rowData = records[i];
        if (rowData && rowData.some && rowData.some((c: string) => String(c).toLowerCase().includes('first name') || String(c).toLowerCase().includes('email address'))) {
            headerRowIdx = i;
            break;
        }
    }
    
    if (headerRowIdx !== -1) {
        headers = records[headerRowIdx];
        rows = records.slice(headerRowIdx + 1);
    } else {
        headers = [];
        rows = records.slice(4);
    }
    
    const idx = {
        id: findHeaderIndex(headers, ['no.']) !== -1 ? findHeaderIndex(headers, ['no.']) : 0,
        lastName: findHeaderIndex(headers, ['last name']) !== -1 ? findHeaderIndex(headers, ['last name']) : 1,
        firstName: findHeaderIndex(headers, ['first name']) !== -1 ? findHeaderIndex(headers, ['first name']) : 2,
        gender: findHeaderIndex(headers, ['gender']) !== -1 ? findHeaderIndex(headers, ['gender']) : 3,
        affiliation: findHeaderIndex(headers, ['affiliation']) !== -1 ? findHeaderIndex(headers, ['affiliation']) : 4,
        email: findHeaderIndex(headers, ['email']) !== -1 ? findHeaderIndex(headers, ['email']) : (filename.includes('Nigeria') ? 6 : 5),
        contact: findHeaderIndex(headers, ['contact']) !== -1 ? findHeaderIndex(headers, ['contact']) : (filename.includes('Nigeria') ? 7 : 6),
        birthdate: findHeaderIndex(headers, ['birthdate']) !== -1 ? findHeaderIndex(headers, ['birthdate']) : (filename.includes('Nigeria') ? 8 : 7),
        age: findHeaderIndex(headers, ['age']) !== -1 ? findHeaderIndex(headers, ['age']) : (filename.includes('Nigeria') ? 9 : 8),
        maritalStatus: findHeaderIndex(headers, ['status'], 0),
        country: findHeaderIndex(headers, ['country', 'residence']) !== -1 ? findHeaderIndex(headers, ['country', 'residence']) : -1,
        activeStatus: findHeaderIndex(headers, ['status'], 1),
    };
    
    if (idx.maritalStatus === -1) idx.maritalStatus = filename.includes('Nigeria') ? 10 : (filename.includes('Congo') ? 10 : 9);
    if (idx.activeStatus === -1) idx.activeStatus = filename.includes('Nigeria') ? 35 : (filename.includes('Democratic') ? 34 : 30);
    
    const mappedData = rows.map((row: any[], index: number) => {
        const _id = row[idx.id] ? Number(row[idx.id]) : index + 1;
        const firstName = row[idx.firstName] ? String(row[idx.firstName]).trim() : null;
        let rawGender = row[idx.gender] ? String(row[idx.gender]).trim() : '';
        
        let gender = rawGender;
        if (GENDER_PLACEHOLDERS.includes(rawGender.toLowerCase()) || !rawGender) {
            gender = firstName ? guessGender(firstName) : 'Male';
        }

        const rawAffiliation = idx.affiliation !== -1 ? row[idx.affiliation] : null;
        const affiliationType = normalizeAffiliation(rawAffiliation);

        let country = idx.country !== -1 ? row[idx.country] : null;
        if ((!country || String(country).trim() === '') && candidateCountry) {
             country = candidateCountry;
        }

        // Capture ALL original data
        const raw_data: Record<string, any> = {};
        headers.forEach((h, i) => {
            if (h && h.trim()) {
                raw_data[h.trim()] = row[i] || '';
            }
        });

        return {
            id: _id || index + 1,
            last_name: row[idx.lastName] ? String(row[idx.lastName]).trim() : null,
            first_name: firstName,
            gender: gender,
            affiliation_type: affiliationType,
            email: idx.email !== -1 ? row[idx.email] : null,
            contact_number: idx.contact !== -1 ? row[idx.contact] : null,
            birthdate: idx.birthdate !== -1 ? row[idx.birthdate] : null,
            age: idx.age !== -1 ? parseAge(row[idx.age]) : null,
            marital_status: idx.maritalStatus !== -1 ? row[idx.maritalStatus] : null,
            country: country || 'Unknown',
            active_status: idx.activeStatus !== -1 ? row[idx.activeStatus] : 'Unknown',
            created_at: new Date().toISOString(),
            raw_data
        };
    }).filter((user: any) => user.first_name || user.last_name);

    return new Response(JSON.stringify({ users: mappedData }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
  }
});
