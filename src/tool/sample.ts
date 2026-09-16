// Representative samples for the "Load sample" actions. Tool-specific.

export const SAMPLE_SQL = `SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = 1
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;
`;

export const SAMPLE_CSV = `id,name,active,score,signup_date
1,Ada Lovelace,true,98.5,2024-01-15
2,Alan Turing,true,100,2023-05-01
3,Grace Hopper,false,87,2022-11-30
4,Margaret Hamilton,true,95.2,
`;

export const SAMPLE_JSON = `[
  { "id": 1, "name": "Ada Lovelace", "active": true, "score": 98.5, "signup_date": "2024-01-15" },
  { "id": 2, "name": "Alan Turing", "active": true, "score": 100, "signup_date": "2023-05-01" },
  { "id": 3, "name": "Grace Hopper", "active": false, "score": 87, "signup_date": "2022-11-30" },
  { "id": 4, "name": "Margaret Hamilton", "active": true, "score": 95.2, "signup_date": null }
]
`;
