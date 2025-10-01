const AWS = require("aws-sdk");
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
    // Removed wrapNumbers since new table uses String partition key
});
const QUOTES_TABLE_NAME = "afterdark-quotes";
const QUOTE_RATING = 'afterdark-quote-ratings';
const LIMBO_TABLE_NAME = 'limbo-afterdark-quotes-updated';
const AUTH_TOKENS_TABLE = 'afterdark-auth-tokens';


// const logThisJson = async (array) => {
//     const params = {
//         TableName: MEMBER_TABLE,
//         Item: array
//     };
//     return await dynamoClient.put(params).promise();
// }

// User data is now stored in auth tokens table - members table deprecated

// Quote Rating System
const getQuote = async (message_id) => {
    const params = {
        TableName: QUOTES_TABLE_NAME,
        Key: {
            message_id: Number(message_id), // Convert to Number for main quotes table
        }
    };

    try {
        console.log("Querying DynamoDB with:", params);
        const result = await dynamoClient.get(params).promise();

        console.log("DynamoDB Response:", result); // Debugging Output

        return result.Item || null; // Use `Item`, not `Items`
    } catch (error) {
        console.error("Error fetching quote rating:", error);
        return null; // Return `null` if there's an error
    }
};

// Quotes Category
const getQuotesLimted = async () => {
    const params = {
        TableName: QUOTES_TABLE_NAME,
        Limit: 1
    };
    const quotes = await dynamoClient.scan(params).promise();
    return quotes['Items'];
}

const getAllQuotes = async () => {
    const params = {
        TableName: QUOTES_TABLE_NAME,
    };
    const quotes = await dynamoClient.scan(params).promise();
    return quotes['Items'];
}

const getRandomQuote = async () => {
    const params = {
        TableName: QUOTES_TABLE_NAME,
        Select: "ALL_ATTRIBUTES"
    };

    try {
        const data = await dynamoClient.scan(params).promise();
        if (data.Items.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * data.Items.length);
        return data.Items[randomIndex]; // Return a random quote object
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

const deleteQuote = async (message_id) => {
    const params = {
        TableName: QUOTES_TABLE_NAME,
        Key: {
            id: message_id,
        }
    };
    return await dynamoClient.delete(params).promise();
}

const addOrUpdateQuote = async (item) => {
    // Convert string message_id to Number for main quotes table (precision loss is acceptable)
    const itemForMainTable = {
        ...item,
        message_id: Number(item.message_id)
    };

    const params = {
        TableName: QUOTES_TABLE_NAME,
        Item: itemForMainTable
    };
    return await dynamoClient.put(params).promise();
}

// Limbo Quotes (potential quotes or junk messages before they get to the Quotes DB)
const getLimboQuotes = async () => {
    const params = {
        TableName: LIMBO_TABLE_NAME,
        Limit: 1
    };
    const quotes = await dynamoClient.scan(params).promise();

    // No need for number processing since new table uses String partition key
    return quotes.Items;
}

const deleteLimboQuote = async (message_id) => {
    // Simple string-based deletion for new table
    const params = {
        TableName: LIMBO_TABLE_NAME,
        Key: {
            message_id: message_id.toString()
        }
    };
    console.log('Deleting with message_id:', message_id.toString(), 'type:', typeof message_id.toString());
    return await dynamoClient.delete(params).promise();
}

const addOrUpdateLimboQuote = async (message_id) => {
    const params = {
        TableName: LIMBO_TABLE_NAME,
        Item: message_id
    };
    return await dynamoClient.put(params).promise();
}

const getLimboQuote = async (message_id) => {
    const params = {
        TableName: LIMBO_TABLE_NAME,
        Key: {
            message_id: message_id.toString()
        }
    };
    console.log('Getting limbo quote with message_id:', message_id.toString(), 'type:', typeof message_id.toString());
    const result = await dynamoClient.get(params).promise();

    // No need for number processing since new table uses String partition key
    return result;
}

const fetchQuoteRating = async (message_id) => {
    const params = {
        TableName: QUOTE_RATING,
        Key: {
            message_id: Number(message_id), // Convert BigInt/String to Number
        }
    };
    try {
        console.log("Querying DynamoDB with:", params);
        const result = await dynamoClient.get(params).promise();

        console.log("DynamoDB Response:", result); // Debugging Output

        // Return the full item instead of just ratings
        return result.Item || null;
    } catch (error) {
        console.error("Error fetching quote rating:", error);
        return null; // Return `null` if there's an error
    }
};


// Quote Rating System
const getQuoteRating = async (message_id) => {
    const params = {
        TableName: QUOTE_RATING,
        Key: { message_id: Number(message_id) } // Convert BigInt/String to Number
    };

    try {
        console.log("Querying DynamoDB with:", params);
        const result = await dynamoClient.get(params).promise();
        console.log("DynamoDB Response:", result); // Debugging Output

        if (result.Item && result.Item.ratings && Array.isArray(result.Item.ratings)) {
            console.log("Corrected Ratings Structure:", result.Item.ratings);

            // Convert ratings from the correct structure
            const ratingsCount = {};

            result.Item.ratings.forEach(ratingEntry => {
                const rating = parseInt(ratingEntry.rating, 10); // Extract rating
                if (ratingsCount[rating]) {
                    ratingsCount[rating]++;
                } else {
                    ratingsCount[rating] = 1;
                }
            });

            return ratingsCount;
        } else {
            return {}; // Return empty object if no ratings found
        }
    } catch (error) {
        console.error("Error fetching quote rating:", error);
        return null;
    }
};

const addOrUpdateQuoteRating = async (ratingData) => {
    // Convert BigInt message_id to Number for ratings table
    const ratingItem = {
        ...ratingData,
        message_id: Number(ratingData.message_id)
    };

    const params = {
        TableName: QUOTE_RATING,
        Item: ratingItem
    };
    return await dynamoClient.put(params).promise();
}

const updateQuoteRating = async (message_id, updatedRatings) => {
    const params = {
        TableName: QUOTE_RATING,
        Key: { message_id: Number(message_id) }, // Convert BigInt/String to Number
        UpdateExpression: "SET ratings = :ratings",
        ExpressionAttributeValues: { ":ratings": updatedRatings },
        ReturnValues: "UPDATED_NEW"
    };
    return await dynamoClient.update(params).promise();
}

// Authentication Token Management

const createAuthToken = async (token, discord_id, username, display_name) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hour expiry

    const tokenData = {
        token: token,
        discord_id: Number(discord_id),
        username: username,
        display_name: display_name,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        used: false
    };

    const params = {
        TableName: AUTH_TOKENS_TABLE,
        Item: tokenData
    };

    return await dynamoClient.put(params).promise();
};

const getAuthToken = async (token) => {
    const params = {
        TableName: AUTH_TOKENS_TABLE,
        Key: { token: token }
    };

    try {
        const result = await dynamoClient.get(params).promise();
        return result.Item || null;
    } catch (error) {
        console.error("Error fetching auth token:", error);
        return null;
    }
};

const markTokenAsUsed = async (token) => {
    const params = {
        TableName: AUTH_TOKENS_TABLE,
        Key: { token: token },
        UpdateExpression: "SET used = :used",
        ExpressionAttributeValues: { ":used": true },
        ReturnValues: "UPDATED_NEW"
    };

    return await dynamoClient.update(params).promise();
};

const validateAuthToken = async (token) => {
    const tokenData = await getAuthToken(token);

    if (!tokenData) {
        return { valid: false, reason: 'Token not found' };
    }

    if (tokenData.used) {
        return { valid: false, reason: 'Token already used' };
    }

    const now = new Date();
    const expiryTime = new Date(tokenData.expires_at);

    if (now > expiryTime) {
        return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, data: tokenData };
};

 
// const getUsers = async () => {
//     const params = {
//         TableName: LOGIN_TABLE
//     };
//     const users = await dynamoClient.scan(params).promise();
//     // console.log(users);
//     return users;
// }

// const deleteUserFromDB = async (email, id) => {
//     const params = {
//         TableName: LOGIN_TABLE,
//         Key: {
//             email: email,
//             id: id,
//         }
//     }
//     try {
//         await dynamoClient.delete(params).promise();
//         console.log(`User with email ${email} and id ${id} deleted successfully.`);
//     } catch (err) {
//         console.error('Error deleting user', err);
//     }
// };

// const getUserFromDB = async (email) => {
//     const params = {
//         TableName: 'LOGIN_TABLE',
//         Key: {
//             email
//         }
//     }
//     return await dynamoClient.get(params).promise();
// };

// const addOrUpdateRegistration = async (array) => {
//     const params = {
//         TableName: LOGIN_TABLE,
//         Item: array
//     };
//     return await dynamoClient.put(params).promise();
// }

// const checkIfEmail = async (emailToCheck) => {
//     const params = {
//         TableName: LOGIN_TABLE,
//         FilterExpression: 'email = :email',
//         ExpressionAttributeValues: {
//             ':email': emailToCheck
//         }
//     };
//     return await dynamoClient.scan(params).promise();
// };

// const addOrUpdateStudent = async (student) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Item: student
//     };
//     return await dynamoClient.put(params).promise();
// }

// const getStudentById = async (id) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: {
//             id
//         }
//     }
//     return await dynamoClient.get(params).promise();
// };

// const deleteStudent = async (id) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: {
//             id
//         }
//     }
//     return await dynamoClient.delete(params).promise();
// };

module.exports = {
    dynamoClient,
    getQuotesLimted,
    getAllQuotes,
    getQuote,
    deleteQuote,
    getRandomQuote,
    addOrUpdateQuote,
    addOrUpdateQuoteRating,
    getLimboQuotes,
    deleteLimboQuote,
    addOrUpdateLimboQuote,
    getLimboQuote,
    getQuoteRating,
    fetchQuoteRating,
    updateQuoteRating,
    createAuthToken,
    getAuthToken,
    markTokenAsUsed,
    validateAuthToken
};