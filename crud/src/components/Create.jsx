import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createUser } from '../features/userDetailsSlice';
import { useNavigate } from 'react-router-dom'

const Create = () => {
    const [users, setUsers] = useState({})
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getUserData = (e) => {
        setUsers({ ...users, [e.target.name]: e.target.value });
        // console.log(users)
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("user...", users);

        dispatch(createUser(users))
        navigate('/read')
    }
    return (
        <>
            <h2 className='text-center'>Create</h2>
            <form className="w-50 mx-auto" method='post' onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" name='name' className="form-control" id="name" onChange={getUserData} />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                    <input type="email" name='email' className="form-control" id="exampleInputEmail1" onChange={getUserData} />
                </div>
                <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input type="text" name='age' className="form-control" id="age" onChange={getUserData} />
                </div>
                <div className="mb-3">
                    <input className="form-check-input" type="radio" name="gender" value='male' id="flexRadioDefault1" onChange={getUserData} />
                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                        Male
                    </label>
                </div>
                <div className="mb-3">
                    <input className="form-check-input" type="radio" name="gender" value='female' id="flexRadioDefault2" onChange={getUserData} />
                    <label className="form-check-label" htmlFor="flexRadioDefault2">
                        Female
                    </label>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </>
    )
}

export default Create