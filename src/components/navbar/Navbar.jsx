import "../navbar/Navbar.css";

function Navbar(props) {
  return (
    <nav>
      <div>
        <h1>{props.heading}</h1>
        <h4>{props.subHeading}</h4>
      </div>
      {props.button && <div className='Nav-btn'><button onClick={props.button.onClick}>{props.button.text}</button></div>}
    </nav>
  );
}

export default Navbar;
