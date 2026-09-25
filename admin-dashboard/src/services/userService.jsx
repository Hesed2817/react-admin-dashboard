const BASE_CREATED_AT = new Date("2026-09-15T09:00:00.000Z");
const CREATED_AT_MONTHS_SPAN = 12;

function deriveUserCreatedAt(id) {
  const monthsBack = Number(id) % CREATED_AT_MONTHS_SPAN;
  const createdAt = new Date(BASE_CREATED_AT);
  createdAt.setUTCMonth(createdAt.getUTCMonth() - monthsBack);
  return createdAt.toISOString();
}

async function getUsers (){
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok){
        throw new Error("Failed to fetch users");
    }
    const users = await response.json();

    const normalisedUsers = users.map((user)=>({
        ...user,
        status: "Active",
        role: user.username,
        isFavorite: false,
        createdAt: deriveUserCreatedAt(user.id),
    }));

    return normalisedUsers;
}

export { getUsers, deriveUserCreatedAt };
