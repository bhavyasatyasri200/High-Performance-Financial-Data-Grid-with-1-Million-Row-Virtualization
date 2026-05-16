import fs from 'fs';
import { faker } from '@faker-js/faker';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const TOTAL_RECORDS = parseInt(process.env.DATA_COUNT || '1000000', 10);
const OUTPUT_FILE = path.join(__dirname, '../public/transactions.json');

const generateData = () => {
    console.log(`Generating ${TOTAL_RECORDS} records...`);
    
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(OUTPUT_FILE);
    writeStream.write('[\n');

    for (let i = 0; i < TOTAL_RECORDS; i++) {
        const record = {
            id: i + 1,
            date: faker.date.past({ years: 2 }).toISOString(),
            merchant: faker.company.name(),
            category: faker.finance.transactionType(),
            amount: parseFloat(faker.finance.amount({ min: 10, max: 10000, dec: 2 })),
            status: faker.helpers.arrayElement(['Completed', 'Pending', 'Failed']),
            description: faker.finance.transactionDescription()
        };

        const isLast = i === TOTAL_RECORDS - 1;
        writeStream.write(JSON.stringify(record) + (isLast ? '' : ',\n'));

        if (i > 0 && i % 100000 === 0) {
            console.log(`Progress: ${i} records...`);
        }
    }

    writeStream.write('\n]');
    writeStream.end();

    writeStream.on('finish', () => {
        console.log(`Successfully generated 1,000,000 records at ${OUTPUT_FILE}`);
    });

    writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
    });
};

generateData();
