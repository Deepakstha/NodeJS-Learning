import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { displayUser } from '../features/userDetailsSlice'
import { store } from '../app/store'
import CustomeModel from './CustomeModel'
import { useState } from 'react'

const Read = () => {
    const dispatch = useDispatch();
    const [id, setId] = useState()
    const [popup, setPopup] = useState(false)

    useEffect(() => {
        dispatch(displayUser());
    }, [])
    const { users, loading } = useSelector((state) => state.app)
    if (loading) {
        return <h1>Loading..</h1>
    }
    return (
        <div>
            <h2>All Data</h2>
            {popup ? <CustomeModel id={id} popup={popup} setPopup={setPopup} /> : users && users.map((data, index) => {
                return (
                    <div className="card w-50 mx-auto" key={index}>
                        <div className="card-body">
                            <h5 className="card-title">{data.name}</h5>
                            <h6 className="card-subtitle mb-2 text-body-secondary">{data.email}</h6>
                            <p className="card-text">{data.gender}</p>
                            <button to="#" className="card-link" onClick={() => { setId(data.id), setPopup(true) }}>View</button>
                            <Link to="#" className="card-link">Edit</Link>
                            <Link to="#" className="card-link">Delete</Link>
                        </div>
                    </div>
                )
            })}

        </div>
    )
}

export default Read