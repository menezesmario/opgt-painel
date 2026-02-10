<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>opgt:malhafundiaria_postgis</Name>
    <UserStyle>
      <Title>Malha Fundiaria por Categoria</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>IRP</Name>
          <Title>Imovel Rural Particular</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>IRP</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#e63946</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#b71c1c</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>ASRFG</Name>
          <Title>Assentamento Reforma Agraria</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>ASRFG</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#f4a261</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#e65100</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>TIH</Name>
          <Title>Terra Indigena Homologada</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>TIH</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#2a9d8f</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#00695c</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>UCUS</Name>
          <Title>UC Uso Sustentavel</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>UCUS</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#264653</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#1b3a4b</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>GPFPND</Name>
          <Title>Gleba Publica Federal</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>GPFPND</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#e9c46a</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#c49000</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>UCPI</Name>
          <Title>UC Protecao Integral</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>UCPI</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#606c38</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#33691e</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>ASSA</Name>
          <Title>Assentamento Estadual</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>ASSA</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#bc6c25</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#8d4e00</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>GP</Name>
          <Title>Gleba Publica</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>GP</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#8338ec</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#5e00c9</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>MD</Name>
          <Title>Militar/Defesa</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>MD</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#fb5607</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#c43e00</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>AU</Name>
          <Title>Area Urbana</Title>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>categoria_fundiaria_v2025</ogc:PropertyName><ogc:Literal>AU</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#808080</CssParameter><CssParameter name="fill-opacity">0.7</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#555555</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Outros</Name>
          <Title>Outras categorias</Title>
          <ElseFilter/>
          <PolygonSymbolizer>
            <Fill><CssParameter name="fill">#7a8570</CssParameter><CssParameter name="fill-opacity">0.6</CssParameter></Fill>
            <Stroke><CssParameter name="stroke">#4a5240</CssParameter><CssParameter name="stroke-width">0.3</CssParameter></Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
