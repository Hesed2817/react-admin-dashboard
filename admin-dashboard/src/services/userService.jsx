async function getUsers (){
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok){
        throw new Error("Failed to fetch users");
    }
    const users = await response.json();

    const normalisedUsers = users.map((user)=>({
        ...user,
        status: "Active",
        role: user.username
    }));
    
    return normalisedUsers;
}

export { getUsers };