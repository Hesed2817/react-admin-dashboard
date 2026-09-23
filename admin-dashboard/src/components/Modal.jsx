function Modal({children, onClose, onConfirm}){
    return(
        <div className="modal">
            {children}  
            <button type="button" onClick={onClose}>Cancel</button>
            {onConfirm && <button type="button" onClick={onConfirm}>Confirm</button>}
        </div>
    );
}

export {Modal};