function PageHeader({title, description, children}){
    return (
        <header>
            <h1>{title}</h1>
            <p>{description}</p>
            {children}
        </header>
    );
}

export {PageHeader};