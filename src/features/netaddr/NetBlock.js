export const NetBlock = ({ block }) => {
  return (
    <div className="NetBlock">
      <table className="NetBlock-table">
        <tbody>
          <tr>
            <td className="NetBlock-row-header">CIDR</td>
            <td className="NetBlock-row-value">{block.start}/{block.prelen}</td>
          </tr>
          <tr>
            <td className="NetBlock-row-header">netmask</td>
            <td className="NetBlock-row-value">{block.netmask}</td>
          </tr>
          <tr>
            <td className="NetBlock-row-header">range</td>
            <td className="NetBlock-row-value">{block.start}-{block.end}</td>
          </tr>
          <tr>
            <td className="NetBlock-row-header">addresses</td>
            <td className="NetBlock-row-value">{block.numaddr}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default NetBlock;
