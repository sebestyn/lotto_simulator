//BEHÍVÁS
    //var               helyiDB = true;
    var        methodOverride = require("method-override");
    var               express = require("express");
    var                   app = express();
    var            bodyParser = require("body-parser");
    var              mongoose = require("mongoose");
    var                  date = new Date().toDateString();

//////////////////////////////////////////////////////////////////////////////////////////
//USE
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:100000}));
    app.use(express.json({limit: '100mb'}));
    
//ADATBÁZIS
    //ADATBÁZIS HELYE
    //    if(helyiDB){
    //        mongoose.connect('mongodb://localhost/lotto', { useNewUrlParser: true });
    //    }else{
    //        mongoose.connect('mongodb://sebestyn:karacsonyhuzas2018@ds233763.mlab.com:33763/karacsonyhuzas', { useNewUrlParser: true });
    //    }
    //ADATOK DB
    //    var nevekSchema = new mongoose.Schema({
    //            nev:String,
    //    });
    //    var adatDB = mongoose.model("adatok", nevekSchema);
 

/////////////////////////////////////////////
//HOME OLDAL
    app.get("/",function (req,res) {
        console.log('HOME')
        res.render("home.ejs");
    });
    app.get("/hu",function (req,res) {
        console.log('HOME HU')
        res.render("home.ejs");
    });
/////////////////////////////////////////////

//FUTTATÁS
    app.post('/run',function(req,res){
        console.log('Calculate....')
        
        var meddigJatszom         = Number(req.body.meddigJatszom);
        var hanySzelveny          = Number(req.body.hanySzelveny);
        var szelvenyAra           = Number(req.body.szelvenyAra);
        var hanyasLotto           = Number(req.body.hanyasLotto);
        var atlagosResztvevok     = Number(req.body.atlagosResztvevok);
        var resztvevokValtozas    = Number(req.body.resztvevokValtozas)/100;
        var szelvenyMaxSzam       = Number(req.body.szelvenyMaxSzam);
        var bevetelbolVisszaArany = Number(req.body.bevetelbolVisszaArany)/100
        var gyorsFuttatas         = (req.body.gyorsFuttatas == 'true');
        var valasztottSzamokString= req.body.szamok;
        var valasztottSzamok      = [];
        
        if(!(valasztottSzamokString == 'false')){
          for(var i=0;i<valasztottSzamokString.length;i++){
            valasztottSzamok.push(Number(valasztottSzamokString[i]))
          }
        }
        else{
          valasztottSzamok = valasztottSzamokString
        }
        
        var futatott = play(gyorsFuttatas,meddigJatszom,hanySzelveny,valasztottSzamok,szelvenyAra,atlagosResztvevok,resztvevokValtozas,hanyasLotto,szelvenyMaxSzam,bevetelbolVisszaArany)
        res.send({a: futatott });
    });
        

//FUNCTIONS
  function randomBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }
  
  function randomSzelveny( hanyasLotto=5, szelvenyMaxSzam=90 ){
    var szamok=[];
    for(var i=0; i<hanyasLotto;i++){
      while(true){
        var a = randomBetween(1,szelvenyMaxSzam);
        if(!szamok.includes(a)){
          szamok.push(a);
          break;
        }
      }
    }
    return szamok;
  }
  function kozos(array1,array2){
    return array1.filter(value => -1 !== array2.indexOf(value)).length;
  }
  function seperate(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function resztvevokGen(resztvevokAtlag=4000000,resztvevokValtozas=0.20,szelvenyeimSzama=1){
    return randomBetween( resztvevokAtlag-(resztvevokAtlag*resztvevokValtozas),resztvevokAtlag+(resztvevokAtlag*resztvevokValtozas)+szelvenyeimSzama )
  }
  function arrayMore(arr, times) {
     var al = arr.length,
         rl = al*times,
         res = new Array(rl);
     for (var i=0; i<rl; i++)
         res[i] = arr[i % al];
     return res;
  }
  function hetekAtvaltasa(hanyhetig){
      var ev = 52.177457
      var honap = 4.34812141
      var hany_ev = 0
      var hany_honap = 0
      var hany_het = hanyhetig
      while (hany_het / ev >= 1){
        hany_ev += 1
        hany_het -= ev
      }
      while (hany_het / honap >= 1){
        hany_honap += 1
        hany_het -= honap
      }
      hany_het = Math.round(hany_het)
      var meddig = ""
      if (hany_ev>0){
        meddig += hany_ev.toString() + " évig, "
      }
      if (hany_honap>0){
        meddig += hany_honap.toString() + " hónapig, "
      }
      if (hany_het>0){
        meddig += hany_het.toString() + " hétig"
      }
      return meddig 
  }
  function sumArrayIndex(array,index){
    var veg = 0;
    for(var j=index;j<array.length;j++){
      veg += parseInt(array[j])
    }
    return veg
  }
  // NORMAL DISTRUBATION
  function normalDist(mean, stdev) {
      var y2;
      var use_last = false;
      return function() {
          var y1;
          if(use_last) {
             y1 = y2;
             use_last = false;
          }
          else {
              var x1, x2, w;
              do {
                   x1 = 2.0 * Math.random() - 1.0;
                   x2 = 2.0 * Math.random() - 1.0;
                   w  = x1 * x1 + x2 * x2;               
              } while( w >= 1.0);
              w = Math.sqrt((-2.0 * Math.log(w))/w);
              y1 = x1 * w;
              y2 = x2 * w;
              use_last = true;
         }
  
         var retval = mean + stdev * y1;
         if(retval >= 0) 
             return retval;
         return -retval;
     }
  }
  function normalDistResztvevok(resztvevokAtlag=4500000,resztvevokValtozas=0.15,szelvenyeimSzama=1){
      var standard = normalDist(resztvevokAtlag, resztvevokAtlag*resztvevokValtozas);
      var resztvevokArray = [];
      for(var i=0; i<50000; i++) {
          resztvevokArray.push(Math.round(standard()))
      }
      var hanyadik = randomBetween(0,resztvevokArray.length-1);
      return resztvevokArray[hanyadik];
  }
  function normalDistTalalatok(resztvevok=5000000){
    //2-es találat
      var talalt2Esely = 1/44;
      var talalat2EselyResztv = talalt2Esely*resztvevok
      var standard = normalDist(talalat2EselyResztv, 500);
      var szamokArray2 = [];
      for(var i=0; i<50000; i++) {
          szamokArray2.push(Math.round(standard(),100))
      }
      var hanyadik2 = randomBetween(0,szamokArray2.length-1);
      var hany2Talalat = szamokArray2[hanyadik2];
    //3-es találat
      var talalt3Esely = 1/1231;
      var talalat3EselyResztv = talalt3Esely*resztvevok
      var standard = normalDist(talalat3EselyResztv, 500);
      var szamokArray3 = [];
      for(var i=0; i<50000; i++) {
          szamokArray3.push(Math.round(standard(),100))
      }
      var hanyadik3 = randomBetween(0,szamokArray3.length-1);
      var hany3Talalat = szamokArray3[hanyadik2];
    //4-es találat
      var talalt4Esely = 1/103410;
      var talalat4EselyResztv = talalt4Esely*resztvevok
      var standard = normalDist(talalat4EselyResztv, 15);
      var szamokArray4 = [];
      for(var i=0; i<50000; i++) {
          szamokArray4.push(Math.round(standard(),100))
      }
      var hanyadik4 = randomBetween(0,szamokArray4.length-1);
      var hany4Talalat = szamokArray4[hanyadik4];
    //5-es találat
      var talalt5Esely = 1/43949268;
      var talalat5EselyResztv = talalt5Esely*resztvevok
      var standard = normalDist(talalat5EselyResztv, 0.27);
      var szamokArray5 = [];
      for(var i=0; i<50000; i++) {
          szamokArray5.push(Math.round(standard(),100))
      }
      var hanyadik5 = randomBetween(0,szamokArray5.length-1);
      var hany5Talalat = szamokArray5[hanyadik5];
      
    return [0,0,hany2Talalat,hany3Talalat,hany4Talalat,hany5Talalat]
  }

//PLAY
  function play(fast=false,hanyHetig=1,szelvenyeimSzama=100,valasztottSzamok=false,szelvenyAra=250,resztvevokAtlag=4500000,resztvevokValtozas=0.15,hanyasLotto=5, szelvenyMaxSzam=90, bevetelbolVisszaArany=0.37,talalatokPenznyerese = [0,0,0.35,0.16,0.15,0.34]){
    var osszesVettSzelveny = 0;
    var szerencsejatekBevetele = 0;
    var osszesTalalatom = arrayMore([0],hanyasLotto+1);
    var osszesTalalatok = arrayMore([0],hanyasLotto+1);
    var osszesenNyertemPenz = 0;
    // STATISZTIKA VÁLTOZÓK
    var statEgyenlegem        = [{"x":0,"y":hanyHetig*szelvenyeimSzama*szelvenyAra}]
    var statBankgyenlege      = [{"x":0,"y":0}] 
    var statTalalataim        = [];
    var statOsszesTalalatok   = [];
    var statResztvevok        = [];
    var statNyertem           = '';
    
    //HETENTE FUT
    for(var het=1; het <= hanyHetig; het++){
      
      var resztvevok = normalDistResztvevok(resztvevokAtlag,resztvevokValtozas,szelvenyeimSzama);
      var nyeroszamok = randomSzelveny(hanyasLotto,szelvenyMaxSzam);
      
      //LASSÚ FUTTATÁS
        if(!fast){
          console.log('SLOW...')
          var talalatok = arrayMore([0],hanyasLotto+1);
          for(var j=0; j < resztvevok; j++){
            var tagSzelvenye = randomSzelveny(hanyasLotto,szelvenyMaxSzam)
            var hanyTalalat = kozos(nyeroszamok,tagSzelvenye)
            talalatok[hanyTalalat] += 1
            osszesTalalatok[hanyTalalat] += 1
          }
        }
      //GYORS FUTTATÁS
        else{
          var talalatok = normalDistTalalatok(resztvevok);
          for(var j=0;j<osszesTalalatok.length;j++){
            osszesTalalatok[j] += Number(talalatok[j]);
          }
        }
      
      
      osszesVettSzelveny += resztvevok+szelvenyeimSzama
      szerencsejatekBevetele += Math.round(resztvevok * szelvenyAra * (1-bevetelbolVisszaArany))
      var nyeresreszantPenz = Math.round(resztvevok * szelvenyAra * bevetelbolVisszaArany)
      var hetenNyertemPenz = 0
      
      for(var i=0; i<szelvenyeimSzama; i++){
        var szelvenyem = [];
        if(!(valasztottSzamok == 'false')){
          szelvenyem = valasztottSzamok;
        }
        else{
          szelvenyem = randomSzelveny(hanyasLotto,szelvenyMaxSzam);
          
        }
        var talalataim = kozos(nyeroszamok,szelvenyem)
        osszesTalalatom[talalataim] += 1
        osszesTalalatok[talalataim] += 1
        var nyertemPenz = Math.round((nyeresreszantPenz * talalatokPenznyerese[talalataim]) / (talalatok[talalataim] + 1))
        hetenNyertemPenz += nyertemPenz
      }
      //EGYENLEGEM STAT
        statEgyenlegem.push({
          "x":het,
          "y": statEgyenlegem[het-1]["y"] - (szelvenyeimSzama*szelvenyAra) + hetenNyertemPenz
        });
      //BANK EGYENLEGE STAT
        statBankgyenlege.push({
          "x":het,
          "y": statBankgyenlege[het-1]["y"]  + (resztvevok * szelvenyAra * (1-bevetelbolVisszaArany))
        });
      //RESZTVEVŐK STAT
        statResztvevok.push({
          "x":het,
          "y":resztvevok
        });
      
      //ÖSSZESEN NYERTEM PÉNZ
      osszesenNyertemPenz += hetenNyertemPenz;
    }
    // NYERTEM STRINGBE
      if(((0-(hanyHetig*szelvenyeimSzama*szelvenyAra)) + osszesenNyertemPenz)>0){
        statNyertem = "Nyertem " + seperate(Math.abs((0-(hanyHetig*szelvenyeimSzama*szelvenyAra)) + osszesenNyertemPenz)) + " Ft-ot"
      }
      else{
        statNyertem = "Vesztettem " + seperate(Math.abs((0-(hanyHetig*szelvenyeimSzama*szelvenyAra)) + osszesenNyertemPenz)) + " Ft-ot"
      }
    
    // TALÁLATAIM STRINGBE
      var talalataimString = "";
      for(var i=0;i<osszesTalalatom.length;i++){
        talalataimString += i.toString() + ": " + osszesTalalatom[i].toString() + " db, "
      }
    //ÖSSZES TALÁLAT STRINGBE
      var masokTalalataiString = "";
      for(var i=0;i<osszesTalalatok.length;i++){
        //LASSÚ FUTTATÁS
          if(!fast){
            masokTalalataiString += i.toString() + ": " + seperate(osszesTalalatok[i].toString()) + " db, "
          }
        // GYORS FUTTATÁS
          else{
            if(i<2){
              masokTalalataiString += i.toString() + ": ? db, "  
            }else{
              masokTalalataiString += i.toString() + ": " + seperate(osszesTalalatok[i].toString()) + " db, "
            }
          }
      }
    //TALÁLATAIM STAT
      for(var i=0;i<osszesTalalatom.length;i++){
        statTalalataim.push({
          "y":osszesTalalatom[i],
          "label":i 
        });
      }
      statTalalataim.shift();
      statTalalataim.shift();
    //ÖSSZES TALÁLATOK STAT
      for(var i=0;i<osszesTalalatok.length;i++){
        statOsszesTalalatok.push({
          "y":osszesTalalatok[i],
          "label":i 
        });
      }
      statOsszesTalalatok.shift();
      statOsszesTalalatok.shift();
    
    var returnAdat={
      "hanyHetigJatszom":hanyHetig,
      "meddigJatszom":hetekAtvaltasa(hanyHetig),
      "mennyibeKerulEgySzelveny":szelvenyAra,
      "hetenteHanySzelvenytVeszek":szelvenyeimSzama,
      "osszesenHanySzevenytVettem":hanyHetig*szelvenyeimSzama,
      "osszesenMennyitFizettem":hanyHetig*szelvenyeimSzama*szelvenyAra,
      "hanySzelvenyemNyert":sumArrayIndex(osszesTalalatom,2),
      "hanySzelvenyemNyertSzazalek":Math.round(Number((sumArrayIndex(osszesTalalatom,2))/(hanyHetig*szelvenyeimSzama))*100),
      "osszesenNyertemPenz":osszesenNyertemPenz,
      "visszanyertemSzazalekban":Math.round((osszesenNyertemPenz/(hanyHetig*szelvenyeimSzama*szelvenyAra))*100),
      "kerestem": (0-(hanyHetig*szelvenyeimSzama*szelvenyAra)) + osszesenNyertemPenz,
      "talalataim":osszesTalalatom,
      "találataimString":talalataimString,
      "masokTalalatai":osszesTalalatok,
      "masokTalalataiString":masokTalalataiString,
      "osszesenHanySzelvenytAdtakEl":osszesVettSzelveny,
      "atlagosanHanySzelvenytVettekPerHet": Math.round(osszesVettSzelveny/hanyHetig),
      "szerencsejatekBevetele":szerencsejatekBevetele,
      "szerencsejatekBevetelePerHet":szerencsejatekBevetele/hanyHetig,
      "statEgyenlegem":statEgyenlegem,
      "statBankgyenlege":statBankgyenlege,
      "statTalalataim":statTalalataim,
      "statOsszesTalalatok":statOsszesTalalatok,
      "statResztvevok":statResztvevok,
      "statNyertem":statNyertem
    }
    return returnAdat
  }
  

//SERVER INDÍTÁSA
    app.listen(process.env.PORT, process.env.IP, function(){
        console.log('lotto_simulator is RUNNING')
    });    
        
        
