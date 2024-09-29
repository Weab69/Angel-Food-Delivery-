import Login from "../shared/Auth/Login"
const AuthScreen = ()=> {
    return(
        <div className="w-full fixed top-0 l-0 h-screen z-50 flex items-center justify-center bg-[#00000027]">
            <div className="w-[400px] h-[400px] bg-slate-900 rounded shadow-sm p-5 ">
                <Login />
            </div> 
        </div>
    )
}

export default AuthScreen;