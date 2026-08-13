import pool from "#db";

export async function getLead(id) {
  const query = `
    SELECT *
    FROM exchange.leads
    WHERE id = $1
  `;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getAllLeads() {
  const query = `
    SELECT *
    FROM exchange.leads
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, []);
  return result.rows;
}

export async function createLead(lead) {
  const query = `
    INSERT INTO exchange.leads
      (name, phone, email, created_by, updated_by, priority, notes, last_contacted)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Medium'), $7, NOW())
    RETURNING *;
  `;
  const values = [
    lead.name,
    lead.phone,
    lead.email,
    lead.created_by,
    lead.updated_by,
    lead.priority,
    lead.notes ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateLead(lead, user_name) {
  const query = `
    UPDATE exchange.leads
    SET name = $1,
        phone = $2,
        email = $3,
        updated_at = NOW(),
        updated_by = $4,
        last_contacted = $5,
        converted = $6,
        contacted = $7,
        responded = $8,
        contact = $9,
        notes = $10,
        priority = $11
    WHERE id = $12
    RETURNING *;
  `;

  const values = [
    lead.name,
    lead.phone,
    lead.email,
    user_name,
    lead.last_contacted,
    lead.converted,
    lead.contacted,
    lead.responded,
    lead.contact,
    lead.notes,
    lead.priority,
    lead.id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteLead(id) {
  const query = `
    DELETE FROM exchange.leads WHERE id = $1
  `;
  const values = [id];
  return await pool.query(query, values);
}
