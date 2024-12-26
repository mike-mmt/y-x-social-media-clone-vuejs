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
        let exists = await client.existsDatabase({
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

    const createClassIfNotExists = async (className) => {
        const classExists = await session.class.get(className).catch(() => null);
        if (!classExists) {
            await session.command(`CREATE CLASS ${className} EXTENDS V`).all();
            console.log(`Class ${className} created.`);
        } else {
            console.log(`Class ${className} already exists.`);
        }
    };

    await createClassIfNotExists('User');
    await createClassIfNotExists('Post');

    session.close();

    return { client, pool };
};

export default setupDatabaseConnection;