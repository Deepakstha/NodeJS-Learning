import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// create action
export const createUser = createAsyncThunk("createUser", async (data, { rejectWithValue }) => {
    const response = await fetch('https://6475c442e607ba4797dc8e6e.mockapi.io/crud', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    try {
        const result = await response.json();
        return result;
    } catch (error) {
        return rejectWithValue(error.response)
    }


})

// read action
export const displayUser = createAsyncThunk("displayUser", async (data, { rejectWithValue }) => {
    const response = await fetch('https://6475c442e607ba4797dc8e6e.mockapi.io/crud');
    try {
        const result = await response.json();
        return result
    } catch (error) {
        console.log("error")
        return rejectWithValue(error)
    }
})


export const userDetails = createSlice({
    name: 'userDetails',
    initialState: {
        users: [],
        loading: false,
        error: null
    },
    extraReducers: {
        [createUser.pending]: (state) => {
            state.loading = true
        },
        [createUser.fulfilled]: (state, action) => {
            state.loading = false
            state.users.push(action.payload)
        },
        [createUser.rejected]: (state, action) => {
            state.loading = false
            state.users = action.payload
        },
        [displayUser.pending]: (state) => {
            state.loading = true
        },
        [displayUser.fulfilled]: (state, action) => {
            state.loading = false
            state.users = action.payload
        },
        [displayUser.rejected]: (state, action) => {
            state.loading = false
            state.users = action.payload
        }
    }
})

export default userDetails.reducer