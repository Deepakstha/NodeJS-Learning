import React from 'react'
import { useSelector } from 'react-redux'
import "./CustomeModel.css"

const CustomeModel = (props) => {
    const allUser = useSelector((state) => state.app.users)
    const singleUser = allUser.filter((ele) => ele.id === props.id)
    return (
        <div className='modalBackground'>
            <div className="modalContainer">
                <button onClick={() => props.setPopup(false)}  >Close</button>
                <h4>{singleUser[0].name}</h4>
                <h4>{singleUser[0].email}</h4>
                <h4>{singleUser[0].age}</h4>
                <h4>{singleUser[0].gender}</h4>
            </div>
        </div>
    )
}

export default CustomeModel