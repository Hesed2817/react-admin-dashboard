function SelectedUser({user: { name, email, role}}){
return (
     <div className="selected-user">
          <h2>Selected User</h2>
          <p>Name:{name}</p>
          <p>Email:{email}</p>
          <p>Role:{role}</p>
        </div>
);
}

export {SelectedUser};