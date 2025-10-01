const AWS = require("aws-sdk");
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true,
    wrapNumbers: true // Preserve precision for reading from old table
});

const OLD_TABLE_NAME = 'limbo-afterdark-quotes';
const NEW_TABLE_NAME = 'limbo-afterdark-quotes-updated';

// Function to migrate all data from old table to new table
async function migrateLimboTable() {
    console.log('Starting migration from', OLD_TABLE_NAME, 'to', NEW_TABLE_NAME);

    let migratedCount = 0;
    let errorCount = 0;
    let lastEvaluatedKey = null;

    do {
        try {
            // Scan old table
            const scanParams = {
                TableName: OLD_TABLE_NAME,
                ExclusiveStartKey: lastEvaluatedKey
            };

            console.log('Scanning old table...');
            const scanResult = await dynamoClient.scan(scanParams).promise();

            console.log(`Found ${scanResult.Items.length} items in this batch`);

            // Process each item
            for (const item of scanResult.Items) {
                try {
                    // Convert message_id to string - handle all possible formats
                    let messageId = item.message_id;
                    if (messageId && typeof messageId === 'object' && messageId.wrapperName === 'DynamoDBNumberValue') {
                        messageId = messageId.value; // Extract string value from wrapper
                    } else if (typeof messageId === 'number') {
                        messageId = messageId.toString(); // Convert number to string
                    }

                    // Ensure it's always a string
                    messageId = String(messageId);

                    console.log(`Processing item: ${messageId} (type: ${typeof messageId})`);


                    // Create new item with string message_id
                    const newItem = {
                        message_id: messageId, // Now as string
                        content: item.content,
                        timestamp: item.timestamp,
                        user: item.user
                    };

                    // Put item in new table
                    const putParams = {
                        TableName: NEW_TABLE_NAME,
                        Item: newItem,
                        ConditionExpression: 'attribute_not_exists(message_id)' // Prevent duplicates
                    };

                    await dynamoClient.put(putParams).promise();
                    migratedCount++;
                    console.log(`✅ Migrated item ${migratedCount}: ${messageId}`);

                } catch (itemError) {
                    if (itemError.code === 'ConditionalCheckFailedException') {
                        console.log(`⚠️  Item already exists in new table: ${item.message_id}`);
                    } else {
                        console.error(`❌ Error migrating item ${item.message_id}:`, itemError.message);
                        errorCount++;
                    }
                }
            }

            lastEvaluatedKey = scanResult.LastEvaluatedKey;

        } catch (scanError) {
            console.error('❌ Error scanning old table:', scanError.message);
            break;
        }

    } while (lastEvaluatedKey);

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} items`);
    console.log(`❌ Errors encountered: ${errorCount} items`);
    console.log(`🎯 New table: ${NEW_TABLE_NAME}`);

    return { migratedCount, errorCount };
}

// Function to verify migration by comparing counts
async function verifyMigration() {
    console.log('\n🔍 Verifying migration...');

    try {
        // Count items in old table
        const oldTableScan = await dynamoClient.scan({
            TableName: OLD_TABLE_NAME,
            Select: 'COUNT'
        }).promise();

        // Count items in new table
        const newTableScan = await dynamoClient.scan({
            TableName: NEW_TABLE_NAME,
            Select: 'COUNT'
        }).promise();

        console.log(`📈 Old table (${OLD_TABLE_NAME}): ${oldTableScan.Count} items`);
        console.log(`📈 New table (${NEW_TABLE_NAME}): ${newTableScan.Count} items`);

        if (oldTableScan.Count === newTableScan.Count) {
            console.log('✅ Migration verification successful! Item counts match.');
        } else {
            console.log('⚠️  Warning: Item counts do not match. Please investigate.');
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting DynamoDB table migration...');

        // Perform migration
        const result = await migrateLimboTable();

        // Verify migration
        await verifyMigration();

        console.log('\n✨ Migration process completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Update your application code to use the new table name');
        console.log('2. Update LIMBO_TABLE_NAME to "limbo-afterdark-quotes-updated"');
        console.log('3. Remove wrapNumbers configuration since new table uses String');
        console.log('4. Test your application thoroughly');
        console.log('5. Once confirmed working, you can delete the old table');

    } catch (error) {
        console.error('💥 Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
if (require.main === module) {
    main();
}

module.exports = { migrateLimboTable, verifyMigration };