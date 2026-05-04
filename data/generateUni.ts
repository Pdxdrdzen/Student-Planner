import * as fs from 'fs';

export type University = {
    name: string,
    shortName: string,
    city: string,
    faculties: string[],
};

async function fetchAllPages(baseUrl: string): Promise<any[]> {
    let allResults: any[] = [];
    let token: string | null = null;
    let hasMorePages = true;
    let pageCount = 0;

    while (hasMorePages) {
        pageCount++;
        const url = token
            ? `${baseUrl}&token=${encodeURIComponent(token)}`
            : baseUrl;

        console.log(`Pobieranie strony ${pageCount} z limitu...`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            allResults = allResults.concat(data.results);
        }

        if (data.pagination && data.pagination.token) {
            if (token === data.pagination.token) {
                hasMorePages = false;
            } else {
                token = data.pagination.token;
            }
        } else {
            hasMorePages = false;
        }
    }

    return allResults;
}

async function generateUniversitiesList() {
    console.log('--- Pobieranie instytucji ---');
    const institutionsData = await fetchAllPages('https://radon.nauka.gov.pl/opendata/polon/institutions?maxResults=1000');

    console.log('--- Pobieranie kierunków (to chwilę potrwa) ---');
    // Łącznie jest ponad 11 000 kierunków, przy 1000 wyników na stronę to około 12 zapytań
    const coursesData = await fetchAllPages('https://radon.nauka.gov.pl/opendata/polon/courses?maxResults=1000');

    console.log('--- Przetwarzanie i mapowanie danych ---');
    const universitiesMap = new Map<string, University>();

    // 1. Zapisujemy uczelnie
    institutionsData.forEach((inst: any) => {
        // Ignorowanie "w likwidacji" oraz upewnienie się, że status uczelni to np. Działa
        const isNotLiquidated = inst.name && !inst.name.toLowerCase().includes('w likwidacji');
        const isActive = inst.statusCode === '1'; // Zazwyczaj 1 oznacza działającą instytucję w tym API

        if (isNotLiquidated && isActive) {
            universitiesMap.set(inst.institutionUuid, {
                name: inst.name,
                shortName: inst.acronym || inst.name.substring(0, 3).toUpperCase(),
                city: inst.addresses?.[0]?.city || 'Brak miasta',
                faculties: []
            });
        }
    });

    // 2. Dopasowujemy kierunki
    coursesData.forEach((course: any) => {
        const institutionId = course.mainInstitutionUuid || course.leadingInstitutionUuid;
        const uni = universitiesMap.get(institutionId);

        // Ważne: Sprawdzamy czy kierunek ma status 'Prowadzony' (lub podobny aktywny)
        // Omijamy wykreślone z rejestru. Kod '1' w POL-ON przeważnie oznacza aktywny.
        const isActiveCourse = course.currentStatusCode === '1' || course.currentStatusName === 'Prowadzony';

        if (uni && course.courseName && isActiveCourse) {
            if (!uni.faculties.includes(course.courseName)) {
                uni.faculties.push(course.courseName);
            }
        }
    });

    // 3. Konwersja, sortowanie kierunków na danej uczelni i odfiltrowanie pustych
    const finalArray: University[] = Array.from(universitiesMap.values())
        .filter(uni => uni.faculties.length > 0)
        .map(uni => {
            // Sortujemy kierunki alfabetycznie dla porządku
            uni.faculties.sort();
            return uni;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // 4. Zapis
    const fileContent = `export type University = {
    name: string,
    shortName: string,
    city: string,
    faculties: string[],
};

export const UNIVERSITIES: University[] = ${JSON.stringify(finalArray, null, 4)};
`;

    fs.writeFileSync('./universities.ts', fileContent);
    console.log(`\nSukces! Zapisano ${finalArray.length} uczelni do pliku universities.ts`);
}

generateUniversitiesList().catch(console.error);