async (page) => {
    const context = await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});
    const mobile = await context.newPage();
    const errors=[]; mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto('http://127.0.0.1:4174/tests/browser-fixture.html?modern');
    await mobile.locator('#sample').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(r);});
    await mobile.waitForTimeout(220);
    await mobile.locator('#utstSelectionBubbleAction').tap();
    await mobile.waitForTimeout(200);
    const settings=await mobile.locator('#settingsButton').boundingBox(),close=await mobile.locator('#closeButton').boundingBox();
    if(settings.x+settings.width>close.x||settings.y!==close.y||settings.width<44)throw Error('Header overlap');
    const text=await mobile.locator('#translationText').boundingBox(),actions=await mobile.locator('#panelTextActions').boundingBox();
    if(text.y+text.height>actions.y+1)throw Error('Actions overlap translation');
    await mobile.screenshot({path:'output/playwright/mobile-toolbar.png'});
    await mobile.locator('#settingsButton').tap();
    const trigger=mobile.locator('#defaultTranslateLangTrigger');
    const box=await trigger.boundingBox();
    const session=await context.newCDPSession(mobile);
    const point={x:box.x+box.width/2,y:box.y+box.height/2};
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    for(let i=1;i<=8;i++){
        await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:point.y-i*10}]});
        await mobile.waitForTimeout(25);
    }
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await mobile.waitForTimeout(350);
    const scroll=await mobile.locator('#settingsPanel').evaluate(el=>el.scrollTop);
    if(scroll<=0)throw Error('Touch scroll blocked');
    if(await mobile.locator('#defaultTranslateLangMenu').isVisible())throw Error('Scroll opened language menu');
    await mobile.locator('#settingsPanel').evaluate(el=>el.scrollTop=0);
    await trigger.tap();
    if(!await mobile.locator('#defaultTranslateLangMenu').isVisible())throw Error('Tap did not open menu');
    await mobile.locator('#defaultTranslateLangMenu button[data-code="fr"]').tap();
    await mobile.locator('#backButton').tap();
    await mobile.locator('#fullscreenToggle').tap();
    const layouts=[];
    for(const [width,height] of [[390,844],[320,568],[844,390],[390,260]]){
        await mobile.setViewportSize({width,height});await mobile.waitForTimeout(150);
        const panel=await mobile.locator('#fullscreenPanel').boundingBox();
        if(panel.x<0||panel.y<0||panel.x+panel.width>width+1||panel.y+panel.height>height+1)throw Error(`Fullscreen overflow ${width}x${height}: ${JSON.stringify(panel)}`);
        await mobile.locator('#fullscreenTargetCopy').scrollIntoViewIfNeeded();
        const copy=await mobile.locator('#fullscreenTargetCopy').boundingBox();
        if(copy.y+copy.height>height+1)throw Error('Unreachable translation action');
        const header=await mobile.locator('#fullscreenHeader').boundingBox();
        if(header.y<0||header.y+header.height>height)throw Error('Header scrolled away');
        const horizontal=await mobile.locator('#fullscreenColumns').evaluate(el=>el.scrollWidth>el.clientWidth+1);
        if(horizontal)throw Error('Columns horizontal overflow');
        layouts.push({width,height,panel});
        if(height===844||width===844)await mobile.screenshot({path:`output/playwright/fullscreen-mobile-${width}.png`});
    }
    await context.close();
    if(errors.length)throw Error(errors.join('\n'));
    return {headerAligned:true,actionsSeparate:true,scrollDidNotOpenMenu:true,realTouchScroll:scroll,tapOpensMenu:true,layouts,errors};
}
