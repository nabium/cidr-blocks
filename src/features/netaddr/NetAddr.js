import NetBlock from "./NetBlock";

const NetAddrNull = () => {
  return <></>;
};

const NetAddrError = ({message}) => {
  return (
    <div className="NetAddr">
      <h3 className="NetAddr-err">Error</h3>
      <div className="NetAddr-errmsg">
        {message}
      </div>
    </div>
  );
};

const NetAddrSuccess = ({netaddr}) => {
  let blockTitlePost = "";
  let additional = null;
  if (netaddr.additional) {
    blockTitlePost = " containing range"
    additional = (
      <div className="NetAddr-additional">
        <h4>Blocks within range:</h4>
        {netaddr.additional.map(block => <NetBlock block={block} key={block.start} />)}
      </div>
    );
  }

  return (
    <div className="NetAddr">
      <h3>{netaddr.source}</h3>
      <div className="NetAddr-block">
        <h4>CIDR block{blockTitlePost}:</h4>
        <NetBlock block={netaddr.block} />
      </div>
      {additional}
    </div>
  );
};

export const NetAddr = ({ netaddr }) => {

  if (!netaddr) {
    return <NetAddrNull />;
  } else if (netaddr.result) {
    return <NetAddrSuccess netaddr={netaddr} />;
  } else {
    return <NetAddrError message={netaddr.message} />;
  }
};

export default NetAddr;
