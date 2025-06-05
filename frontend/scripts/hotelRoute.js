router.post('/hotels', async (req, res) => {
    const { name, room_price_per_day, child_charge_per_day } = req.body;

    if (!name || !room_price_per_day) {
        return res.status(400).send('Invalid hotel data');
    }

    try {
        const pool = await connectToDB();
        await pool.request()
            .input('Name', sql.NVarChar(255), name)
            .input('RoomPrice', sql.Decimal(10, 2), room_price_per_day)
            .input('ChildCharge', sql.Decimal(10, 2), child_charge_per_day || 0)
            .query(`
                INSERT INTO Hotels (name, room_price_per_day, child_charge_per_day)
                VALUES (@Name, @RoomPrice, @ChildCharge)
            `);

        res.send('Hotel added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving hotel');
    }
});
