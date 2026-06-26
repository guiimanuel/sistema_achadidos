import React from "react";
import EscolherImagem from "./EscolherImagemScreen";

function EscolherImagemEditar(props) {
  return <EscolherImagem {...props} route={{ ...props.route, params: { origem: "EditarItem" } }} />;
}

export default EscolherImagemEditar;
