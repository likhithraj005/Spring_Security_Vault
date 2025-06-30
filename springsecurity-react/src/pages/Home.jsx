import MenuBar from "../components/MenuBar.jsx";
import Header from "../components/Header.jsx";

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-content-center min-vh-100">
            <MenuBar/>
            <Header/>
        </div>
    )
}

export default Home;