import OrientDB from "orientjs";
const {OrientDBClient} = OrientDB;

// połączenie z bazą i stworzenie bazy i klas jeśli nie istnieją
const setupDatabaseConnection = async (config) => {
    let client = await OrientDBClient.connect({
        host: config.host,
        port: config.port,
    });

    // tworzymy bazę tswproject jeśli nie istnieje
    try {
        await client.existsDatabase({
            name: config.db,
            username: config.rootUser,
            password: config.rootPassword
        });
    } catch (err) {
        if (err instanceof OrientDB.RequestError) {
            await client.createDatabase({
                name: config.db,
                username: config.rootUser,
                password: config.rootPassword
            });
        }
    }

    let pool = await client.sessions({
        name: config.db,
        username: config.rootUser,
        password: config.rootPassword,
        pool: {
            max: 25
        }
    });

    const session = await pool.acquire();

    const createClassIfNotExists = async (className, classType /* V or E */, additionalCommands = []) => {
        const classExists = await session.class.get(className).catch(() => null);
        if (!classExists) {
            await session.command(`CREATE CLASS ${className} EXTENDS ${classType}`).all();
            for (const command of additionalCommands) {
                await session.command(command);
            }
            console.log(`Class ${className} created.`);
        } else {
            console.log(`Class ${className} already exists.`);
        }
    };

    await createClassIfNotExists('User', 'V');
    await createClassIfNotExists('Post', 'V');
    await createClassIfNotExists('Posted', 'E', ['CREATE PROPERTY Posted.out LINK User', 'CREATE PROPERTY Posted.in LINK Post']);
    await createClassIfNotExists('Reply', 'E', ['CREATE PROPERTY Reply.out LINK Post', 'CREATE PROPERTY Reply.in LINK Post']);
    await createClassIfNotExists('Likes', 'E', ['CREATE PROPERTY Likes.out LINK User', 'CREATE PROPERTY Likes.in LINK Post']);
    await createClassIfNotExists('Follows', 'E', ['CREATE PROPERTY Follows.out LINK User', 'CREATE PROPERTY Follows.in LINK User']);
    await createClassIfNotExists('Muted', 'E', ['CREATE PROPERTY Muted.out LINK User', 'CREATE PROPERTY Muted.in LINK User']);
    await createClassIfNotExists('Blocked', 'E', ['CREATE PROPERTY Blocked.out LINK User', 'CREATE PROPERTY Blocked.in LINK User']);

    session.close();

    return { client, pool };
};

export default setupDatabaseConnection;