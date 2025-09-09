*** Settings ***
Library    SeleniumLibrary
Library    Collections
Library    OperatingSystem

*** Variables ***
@{URLS}    https://searchlaw.ocs.go.th/council-of-state/#/public/doc/eFhxaEtwRW1DWWlkZkowUlluTHUzQT09    https://searchlaw.ocs.go.th/council-of-state/#/public/doc/OFl5b0Q5Q3cybnFmL1NTYlRqbHZaUT09

*** Test Cases ***
Extract Law Articles
    FOR    ${url}    IN    @{URLS}
        Open Browser    ${url}    Chrome
        Sleep    1s
        Wait Until Page Contains Element    //div[@class="in-a4"]    timeout=10s
        ${act_name}=    Get Text    //div[@class="col-12 mb-3 line-ellipsis"]
        Log    Act Name: ${act_name}
        Create File    act_${act_name}.txt    ${act_name}\n
        ${section_count}=    Get Element Count    //div[@class="in-a4"]/div
        Log    Number of Sections: ${section_count}
        FOR    ${block}    IN RANGE    1    ${section_count} + 1
            ${paraphrases}=    Get Element Count    //div[@class="in-a4"]/div[${block}]/p
            Log    Number of Paragraphs in Section ${block}: ${paraphrases}
            ${section}=    Create List
            FOR    ${p}    IN RANGE    1    ${paraphrases} + 1
                ${text}=    Get Text    //div[@class="in-a4"]/div[${block}]/p[${p}]
                Append To List    ${section}    ${text}
                Append To File    act_${act_name}.txt    ${text}\n
            END
            Append To File    act_${act_name}.txt    ---------------------\n
            Log    Article: ${act_name}
            Log    Texts: ${section}
        END
        Close Browser
    END