function StatCard({ title, value, description }){
    return(
        <div className="stat-card">
            <h3>{title}</h3>
            <p>{value}</p>
            <span>{description}</span>
        </div>
    );
}

export { StatCard };