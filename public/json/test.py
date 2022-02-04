import pandas as pd

if __name__ == "__main__":
    #import excel file
    xlsx = pd.ExcelFile('excel.xlsx')

    #divide the existing sheets
    df1 = pd.read_excel(xlsx, 'TERMOS GERAIS')
    df2 = pd.read_excel(xlsx, 'RAMO VIDA')
    df3 = pd.read_excel(xlsx, 'RAMO NÃO VIDA')
    df4 = pd.read_excel(xlsx, 'COSSEGURO E RESSEGURO')

    
    df4 = df4.rename(columns = {"CONCEITO (PORTUGUÊS)":"CONCEITO"})   

    #export data in json files
    with open("termosGerais.json", "w", encoding='utf-8') as outfile:
        df1.to_json(outfile, force_ascii=False)
        outfile.write('\n')
    with open("ramoVida.json", "w", encoding='utf-8') as outfile:
        df2.to_json(outfile, force_ascii=False)
        outfile.write('\n')
    with open("ramoNaoVida.json", "w", encoding='utf-8') as outfile:
        df3.to_json(outfile, force_ascii=False)
        outfile.write('\n')
    with open("resseguro.json", "w", encoding='utf-8') as outfile:
        df4.to_json(outfile, force_ascii=False)
        outfile.write('\n')
    
