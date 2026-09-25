function SelectedUser({user: { name, email, role, status, isFavorite: isFav}}){
return (
     <div className="selected-user">
          <h2>Selected User</h2>
          <p>Name:{name}</p>
          <p>Email:{email}</p>
          <p>Role:{role}</p>
          <p>Favorite: {isFav ? "Yes" : "No"}</p>
          <p>Status: {status}</p>
        </div>
);
}

export {SelectedUser};