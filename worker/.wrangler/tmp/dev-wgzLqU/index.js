var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-0o26pU/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request2 = new Request(input, init);
  request2.headers.delete("CF-Connecting-IP");
  return request2;
}
var init_strip_cf_connecting_ip_header = __esm({
  ".wrangler/tmp/bundle-0o26pU/strip-cf-connecting-ip-header.js"() {
    __name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader.apply(null, argArray)
        ]);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
  }
});

// ../../../usr/local/share/nvm/versions/node/v20.19.0/lib/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../../usr/local/share/nvm/versions/node/v20.19.0/lib/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/mime/Mime.js
var require_Mime = __commonJS({
  "node_modules/mime/Mime.js"(exports, module) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    function Mime() {
      this._types = /* @__PURE__ */ Object.create(null);
      this._extensions = /* @__PURE__ */ Object.create(null);
      for (let i = 0; i < arguments.length; i++) {
        this.define(arguments[i]);
      }
      this.define = this.define.bind(this);
      this.getType = this.getType.bind(this);
      this.getExtension = this.getExtension.bind(this);
    }
    __name(Mime, "Mime");
    Mime.prototype.define = function(typeMap, force) {
      for (let type in typeMap) {
        let extensions = typeMap[type].map(function(t) {
          return t.toLowerCase();
        });
        type = type.toLowerCase();
        for (let i = 0; i < extensions.length; i++) {
          const ext = extensions[i];
          if (ext[0] === "*") {
            continue;
          }
          if (!force && ext in this._types) {
            throw new Error(
              'Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".'
            );
          }
          this._types[ext] = type;
        }
        if (force || !this._extensions[type]) {
          const ext = extensions[0];
          this._extensions[type] = ext[0] !== "*" ? ext : ext.substr(1);
        }
      }
    };
    Mime.prototype.getType = function(path) {
      path = String(path);
      let last = path.replace(/^.*[/\\]/, "").toLowerCase();
      let ext = last.replace(/^.*\./, "").toLowerCase();
      let hasPath = last.length < path.length;
      let hasDot = ext.length < last.length - 1;
      return (hasDot || !hasPath) && this._types[ext] || null;
    };
    Mime.prototype.getExtension = function(type) {
      type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
      return type && this._extensions[type.toLowerCase()] || null;
    };
    module.exports = Mime;
  }
});

// node_modules/mime/types/standard.js
var require_standard = __commonJS({
  "node_modules/mime/types/standard.js"(exports, module) {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    module.exports = { "application/andrew-inset": ["ez"], "application/applixware": ["aw"], "application/atom+xml": ["atom"], "application/atomcat+xml": ["atomcat"], "application/atomdeleted+xml": ["atomdeleted"], "application/atomsvc+xml": ["atomsvc"], "application/atsc-dwd+xml": ["dwd"], "application/atsc-held+xml": ["held"], "application/atsc-rsat+xml": ["rsat"], "application/bdoc": ["bdoc"], "application/calendar+xml": ["xcs"], "application/ccxml+xml": ["ccxml"], "application/cdfx+xml": ["cdfx"], "application/cdmi-capability": ["cdmia"], "application/cdmi-container": ["cdmic"], "application/cdmi-domain": ["cdmid"], "application/cdmi-object": ["cdmio"], "application/cdmi-queue": ["cdmiq"], "application/cu-seeme": ["cu"], "application/dash+xml": ["mpd"], "application/davmount+xml": ["davmount"], "application/docbook+xml": ["dbk"], "application/dssc+der": ["dssc"], "application/dssc+xml": ["xdssc"], "application/ecmascript": ["es", "ecma"], "application/emma+xml": ["emma"], "application/emotionml+xml": ["emotionml"], "application/epub+zip": ["epub"], "application/exi": ["exi"], "application/express": ["exp"], "application/fdt+xml": ["fdt"], "application/font-tdpfr": ["pfr"], "application/geo+json": ["geojson"], "application/gml+xml": ["gml"], "application/gpx+xml": ["gpx"], "application/gxf": ["gxf"], "application/gzip": ["gz"], "application/hjson": ["hjson"], "application/hyperstudio": ["stk"], "application/inkml+xml": ["ink", "inkml"], "application/ipfix": ["ipfix"], "application/its+xml": ["its"], "application/java-archive": ["jar", "war", "ear"], "application/java-serialized-object": ["ser"], "application/java-vm": ["class"], "application/javascript": ["js", "mjs"], "application/json": ["json", "map"], "application/json5": ["json5"], "application/jsonml+json": ["jsonml"], "application/ld+json": ["jsonld"], "application/lgr+xml": ["lgr"], "application/lost+xml": ["lostxml"], "application/mac-binhex40": ["hqx"], "application/mac-compactpro": ["cpt"], "application/mads+xml": ["mads"], "application/manifest+json": ["webmanifest"], "application/marc": ["mrc"], "application/marcxml+xml": ["mrcx"], "application/mathematica": ["ma", "nb", "mb"], "application/mathml+xml": ["mathml"], "application/mbox": ["mbox"], "application/mediaservercontrol+xml": ["mscml"], "application/metalink+xml": ["metalink"], "application/metalink4+xml": ["meta4"], "application/mets+xml": ["mets"], "application/mmt-aei+xml": ["maei"], "application/mmt-usd+xml": ["musd"], "application/mods+xml": ["mods"], "application/mp21": ["m21", "mp21"], "application/mp4": ["mp4s", "m4p"], "application/msword": ["doc", "dot"], "application/mxf": ["mxf"], "application/n-quads": ["nq"], "application/n-triples": ["nt"], "application/node": ["cjs"], "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"], "application/oda": ["oda"], "application/oebps-package+xml": ["opf"], "application/ogg": ["ogx"], "application/omdoc+xml": ["omdoc"], "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"], "application/oxps": ["oxps"], "application/p2p-overlay+xml": ["relo"], "application/patch-ops-error+xml": ["xer"], "application/pdf": ["pdf"], "application/pgp-encrypted": ["pgp"], "application/pgp-signature": ["asc", "sig"], "application/pics-rules": ["prf"], "application/pkcs10": ["p10"], "application/pkcs7-mime": ["p7m", "p7c"], "application/pkcs7-signature": ["p7s"], "application/pkcs8": ["p8"], "application/pkix-attr-cert": ["ac"], "application/pkix-cert": ["cer"], "application/pkix-crl": ["crl"], "application/pkix-pkipath": ["pkipath"], "application/pkixcmp": ["pki"], "application/pls+xml": ["pls"], "application/postscript": ["ai", "eps", "ps"], "application/provenance+xml": ["provx"], "application/pskc+xml": ["pskcxml"], "application/raml+yaml": ["raml"], "application/rdf+xml": ["rdf", "owl"], "application/reginfo+xml": ["rif"], "application/relax-ng-compact-syntax": ["rnc"], "application/resource-lists+xml": ["rl"], "application/resource-lists-diff+xml": ["rld"], "application/rls-services+xml": ["rs"], "application/route-apd+xml": ["rapd"], "application/route-s-tsid+xml": ["sls"], "application/route-usd+xml": ["rusd"], "application/rpki-ghostbusters": ["gbr"], "application/rpki-manifest": ["mft"], "application/rpki-roa": ["roa"], "application/rsd+xml": ["rsd"], "application/rss+xml": ["rss"], "application/rtf": ["rtf"], "application/sbml+xml": ["sbml"], "application/scvp-cv-request": ["scq"], "application/scvp-cv-response": ["scs"], "application/scvp-vp-request": ["spq"], "application/scvp-vp-response": ["spp"], "application/sdp": ["sdp"], "application/senml+xml": ["senmlx"], "application/sensml+xml": ["sensmlx"], "application/set-payment-initiation": ["setpay"], "application/set-registration-initiation": ["setreg"], "application/shf+xml": ["shf"], "application/sieve": ["siv", "sieve"], "application/smil+xml": ["smi", "smil"], "application/sparql-query": ["rq"], "application/sparql-results+xml": ["srx"], "application/srgs": ["gram"], "application/srgs+xml": ["grxml"], "application/sru+xml": ["sru"], "application/ssdl+xml": ["ssdl"], "application/ssml+xml": ["ssml"], "application/swid+xml": ["swidtag"], "application/tei+xml": ["tei", "teicorpus"], "application/thraud+xml": ["tfi"], "application/timestamped-data": ["tsd"], "application/toml": ["toml"], "application/trig": ["trig"], "application/ttml+xml": ["ttml"], "application/ubjson": ["ubj"], "application/urc-ressheet+xml": ["rsheet"], "application/urc-targetdesc+xml": ["td"], "application/voicexml+xml": ["vxml"], "application/wasm": ["wasm"], "application/widget": ["wgt"], "application/winhlp": ["hlp"], "application/wsdl+xml": ["wsdl"], "application/wspolicy+xml": ["wspolicy"], "application/xaml+xml": ["xaml"], "application/xcap-att+xml": ["xav"], "application/xcap-caps+xml": ["xca"], "application/xcap-diff+xml": ["xdf"], "application/xcap-el+xml": ["xel"], "application/xcap-ns+xml": ["xns"], "application/xenc+xml": ["xenc"], "application/xhtml+xml": ["xhtml", "xht"], "application/xliff+xml": ["xlf"], "application/xml": ["xml", "xsl", "xsd", "rng"], "application/xml-dtd": ["dtd"], "application/xop+xml": ["xop"], "application/xproc+xml": ["xpl"], "application/xslt+xml": ["*xsl", "xslt"], "application/xspf+xml": ["xspf"], "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"], "application/yang": ["yang"], "application/yin+xml": ["yin"], "application/zip": ["zip"], "audio/3gpp": ["*3gpp"], "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp3": ["*mp3"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/wave": ["*wav"], "audio/webm": ["weba"], "audio/xm": ["xm"], "font/collection": ["ttc"], "font/otf": ["otf"], "font/ttf": ["ttf"], "font/woff": ["woff"], "font/woff2": ["woff2"], "image/aces": ["exr"], "image/apng": ["apng"], "image/avif": ["avif"], "image/bmp": ["bmp"], "image/cgm": ["cgm"], "image/dicom-rle": ["drle"], "image/emf": ["emf"], "image/fits": ["fits"], "image/g3fax": ["g3"], "image/gif": ["gif"], "image/heic": ["heic"], "image/heic-sequence": ["heics"], "image/heif": ["heif"], "image/heif-sequence": ["heifs"], "image/hej2k": ["hej2"], "image/hsj2": ["hsj2"], "image/ief": ["ief"], "image/jls": ["jls"], "image/jp2": ["jp2", "jpg2"], "image/jpeg": ["jpeg", "jpg", "jpe"], "image/jph": ["jph"], "image/jphc": ["jhc"], "image/jpm": ["jpm"], "image/jpx": ["jpx", "jpf"], "image/jxr": ["jxr"], "image/jxra": ["jxra"], "image/jxrs": ["jxrs"], "image/jxs": ["jxs"], "image/jxsc": ["jxsc"], "image/jxsi": ["jxsi"], "image/jxss": ["jxss"], "image/ktx": ["ktx"], "image/ktx2": ["ktx2"], "image/png": ["png"], "image/sgi": ["sgi"], "image/svg+xml": ["svg", "svgz"], "image/t38": ["t38"], "image/tiff": ["tif", "tiff"], "image/tiff-fx": ["tfx"], "image/webp": ["webp"], "image/wmf": ["wmf"], "message/disposition-notification": ["disposition-notification"], "message/global": ["u8msg"], "message/global-delivery-status": ["u8dsn"], "message/global-disposition-notification": ["u8mdn"], "message/global-headers": ["u8hdr"], "message/rfc822": ["eml", "mime"], "model/3mf": ["3mf"], "model/gltf+json": ["gltf"], "model/gltf-binary": ["glb"], "model/iges": ["igs", "iges"], "model/mesh": ["msh", "mesh", "silo"], "model/mtl": ["mtl"], "model/obj": ["obj"], "model/step+xml": ["stpx"], "model/step+zip": ["stpz"], "model/step-xml+zip": ["stpxz"], "model/stl": ["stl"], "model/vrml": ["wrl", "vrml"], "model/x3d+binary": ["*x3db", "x3dbz"], "model/x3d+fastinfoset": ["x3db"], "model/x3d+vrml": ["*x3dv", "x3dvz"], "model/x3d+xml": ["x3d", "x3dz"], "model/x3d-vrml": ["x3dv"], "text/cache-manifest": ["appcache", "manifest"], "text/calendar": ["ics", "ifb"], "text/coffeescript": ["coffee", "litcoffee"], "text/css": ["css"], "text/csv": ["csv"], "text/html": ["html", "htm", "shtml"], "text/jade": ["jade"], "text/jsx": ["jsx"], "text/less": ["less"], "text/markdown": ["markdown", "md"], "text/mathml": ["mml"], "text/mdx": ["mdx"], "text/n3": ["n3"], "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"], "text/richtext": ["rtx"], "text/rtf": ["*rtf"], "text/sgml": ["sgml", "sgm"], "text/shex": ["shex"], "text/slim": ["slim", "slm"], "text/spdx": ["spdx"], "text/stylus": ["stylus", "styl"], "text/tab-separated-values": ["tsv"], "text/troff": ["t", "tr", "roff", "man", "me", "ms"], "text/turtle": ["ttl"], "text/uri-list": ["uri", "uris", "urls"], "text/vcard": ["vcard"], "text/vtt": ["vtt"], "text/xml": ["*xml"], "text/yaml": ["yaml", "yml"], "video/3gpp": ["3gp", "3gpp"], "video/3gpp2": ["3g2"], "video/h261": ["h261"], "video/h263": ["h263"], "video/h264": ["h264"], "video/iso.segment": ["m4s"], "video/jpeg": ["jpgv"], "video/jpm": ["*jpm", "jpgm"], "video/mj2": ["mj2", "mjp2"], "video/mp2t": ["ts"], "video/mp4": ["mp4", "mp4v", "mpg4"], "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"], "video/ogg": ["ogv"], "video/quicktime": ["qt", "mov"], "video/webm": ["webm"] };
  }
});

// node_modules/mime/types/other.js
var require_other = __commonJS({
  "node_modules/mime/types/other.js"(exports, module) {
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    module.exports = { "application/prs.cww": ["cww"], "application/vnd.1000minds.decision-model+xml": ["1km"], "application/vnd.3gpp.pic-bw-large": ["plb"], "application/vnd.3gpp.pic-bw-small": ["psb"], "application/vnd.3gpp.pic-bw-var": ["pvb"], "application/vnd.3gpp2.tcap": ["tcap"], "application/vnd.3m.post-it-notes": ["pwn"], "application/vnd.accpac.simply.aso": ["aso"], "application/vnd.accpac.simply.imp": ["imp"], "application/vnd.acucobol": ["acu"], "application/vnd.acucorp": ["atc", "acutc"], "application/vnd.adobe.air-application-installer-package+zip": ["air"], "application/vnd.adobe.formscentral.fcdt": ["fcdt"], "application/vnd.adobe.fxp": ["fxp", "fxpl"], "application/vnd.adobe.xdp+xml": ["xdp"], "application/vnd.adobe.xfdf": ["xfdf"], "application/vnd.ahead.space": ["ahead"], "application/vnd.airzip.filesecure.azf": ["azf"], "application/vnd.airzip.filesecure.azs": ["azs"], "application/vnd.amazon.ebook": ["azw"], "application/vnd.americandynamics.acc": ["acc"], "application/vnd.amiga.ami": ["ami"], "application/vnd.android.package-archive": ["apk"], "application/vnd.anser-web-certificate-issue-initiation": ["cii"], "application/vnd.anser-web-funds-transfer-initiation": ["fti"], "application/vnd.antix.game-component": ["atx"], "application/vnd.apple.installer+xml": ["mpkg"], "application/vnd.apple.keynote": ["key"], "application/vnd.apple.mpegurl": ["m3u8"], "application/vnd.apple.numbers": ["numbers"], "application/vnd.apple.pages": ["pages"], "application/vnd.apple.pkpass": ["pkpass"], "application/vnd.aristanetworks.swi": ["swi"], "application/vnd.astraea-software.iota": ["iota"], "application/vnd.audiograph": ["aep"], "application/vnd.balsamiq.bmml+xml": ["bmml"], "application/vnd.blueice.multipass": ["mpm"], "application/vnd.bmi": ["bmi"], "application/vnd.businessobjects": ["rep"], "application/vnd.chemdraw+xml": ["cdxml"], "application/vnd.chipnuts.karaoke-mmd": ["mmd"], "application/vnd.cinderella": ["cdy"], "application/vnd.citationstyles.style+xml": ["csl"], "application/vnd.claymore": ["cla"], "application/vnd.cloanto.rp9": ["rp9"], "application/vnd.clonk.c4group": ["c4g", "c4d", "c4f", "c4p", "c4u"], "application/vnd.cluetrust.cartomobile-config": ["c11amc"], "application/vnd.cluetrust.cartomobile-config-pkg": ["c11amz"], "application/vnd.commonspace": ["csp"], "application/vnd.contact.cmsg": ["cdbcmsg"], "application/vnd.cosmocaller": ["cmc"], "application/vnd.crick.clicker": ["clkx"], "application/vnd.crick.clicker.keyboard": ["clkk"], "application/vnd.crick.clicker.palette": ["clkp"], "application/vnd.crick.clicker.template": ["clkt"], "application/vnd.crick.clicker.wordbank": ["clkw"], "application/vnd.criticaltools.wbs+xml": ["wbs"], "application/vnd.ctc-posml": ["pml"], "application/vnd.cups-ppd": ["ppd"], "application/vnd.curl.car": ["car"], "application/vnd.curl.pcurl": ["pcurl"], "application/vnd.dart": ["dart"], "application/vnd.data-vision.rdz": ["rdz"], "application/vnd.dbf": ["dbf"], "application/vnd.dece.data": ["uvf", "uvvf", "uvd", "uvvd"], "application/vnd.dece.ttml+xml": ["uvt", "uvvt"], "application/vnd.dece.unspecified": ["uvx", "uvvx"], "application/vnd.dece.zip": ["uvz", "uvvz"], "application/vnd.denovo.fcselayout-link": ["fe_launch"], "application/vnd.dna": ["dna"], "application/vnd.dolby.mlp": ["mlp"], "application/vnd.dpgraph": ["dpg"], "application/vnd.dreamfactory": ["dfac"], "application/vnd.ds-keypoint": ["kpxx"], "application/vnd.dvb.ait": ["ait"], "application/vnd.dvb.service": ["svc"], "application/vnd.dynageo": ["geo"], "application/vnd.ecowin.chart": ["mag"], "application/vnd.enliven": ["nml"], "application/vnd.epson.esf": ["esf"], "application/vnd.epson.msf": ["msf"], "application/vnd.epson.quickanime": ["qam"], "application/vnd.epson.salt": ["slt"], "application/vnd.epson.ssf": ["ssf"], "application/vnd.eszigno3+xml": ["es3", "et3"], "application/vnd.ezpix-album": ["ez2"], "application/vnd.ezpix-package": ["ez3"], "application/vnd.fdf": ["fdf"], "application/vnd.fdsn.mseed": ["mseed"], "application/vnd.fdsn.seed": ["seed", "dataless"], "application/vnd.flographit": ["gph"], "application/vnd.fluxtime.clip": ["ftc"], "application/vnd.framemaker": ["fm", "frame", "maker", "book"], "application/vnd.frogans.fnc": ["fnc"], "application/vnd.frogans.ltf": ["ltf"], "application/vnd.fsc.weblaunch": ["fsc"], "application/vnd.fujitsu.oasys": ["oas"], "application/vnd.fujitsu.oasys2": ["oa2"], "application/vnd.fujitsu.oasys3": ["oa3"], "application/vnd.fujitsu.oasysgp": ["fg5"], "application/vnd.fujitsu.oasysprs": ["bh2"], "application/vnd.fujixerox.ddd": ["ddd"], "application/vnd.fujixerox.docuworks": ["xdw"], "application/vnd.fujixerox.docuworks.binder": ["xbd"], "application/vnd.fuzzysheet": ["fzs"], "application/vnd.genomatix.tuxedo": ["txd"], "application/vnd.geogebra.file": ["ggb"], "application/vnd.geogebra.tool": ["ggt"], "application/vnd.geometry-explorer": ["gex", "gre"], "application/vnd.geonext": ["gxt"], "application/vnd.geoplan": ["g2w"], "application/vnd.geospace": ["g3w"], "application/vnd.gmx": ["gmx"], "application/vnd.google-apps.document": ["gdoc"], "application/vnd.google-apps.presentation": ["gslides"], "application/vnd.google-apps.spreadsheet": ["gsheet"], "application/vnd.google-earth.kml+xml": ["kml"], "application/vnd.google-earth.kmz": ["kmz"], "application/vnd.grafeq": ["gqf", "gqs"], "application/vnd.groove-account": ["gac"], "application/vnd.groove-help": ["ghf"], "application/vnd.groove-identity-message": ["gim"], "application/vnd.groove-injector": ["grv"], "application/vnd.groove-tool-message": ["gtm"], "application/vnd.groove-tool-template": ["tpl"], "application/vnd.groove-vcard": ["vcg"], "application/vnd.hal+xml": ["hal"], "application/vnd.handheld-entertainment+xml": ["zmm"], "application/vnd.hbci": ["hbci"], "application/vnd.hhe.lesson-player": ["les"], "application/vnd.hp-hpgl": ["hpgl"], "application/vnd.hp-hpid": ["hpid"], "application/vnd.hp-hps": ["hps"], "application/vnd.hp-jlyt": ["jlt"], "application/vnd.hp-pcl": ["pcl"], "application/vnd.hp-pclxl": ["pclxl"], "application/vnd.hydrostatix.sof-data": ["sfd-hdstx"], "application/vnd.ibm.minipay": ["mpy"], "application/vnd.ibm.modcap": ["afp", "listafp", "list3820"], "application/vnd.ibm.rights-management": ["irm"], "application/vnd.ibm.secure-container": ["sc"], "application/vnd.iccprofile": ["icc", "icm"], "application/vnd.igloader": ["igl"], "application/vnd.immervision-ivp": ["ivp"], "application/vnd.immervision-ivu": ["ivu"], "application/vnd.insors.igm": ["igm"], "application/vnd.intercon.formnet": ["xpw", "xpx"], "application/vnd.intergeo": ["i2g"], "application/vnd.intu.qbo": ["qbo"], "application/vnd.intu.qfx": ["qfx"], "application/vnd.ipunplugged.rcprofile": ["rcprofile"], "application/vnd.irepository.package+xml": ["irp"], "application/vnd.is-xpr": ["xpr"], "application/vnd.isac.fcs": ["fcs"], "application/vnd.jam": ["jam"], "application/vnd.jcp.javame.midlet-rms": ["rms"], "application/vnd.jisp": ["jisp"], "application/vnd.joost.joda-archive": ["joda"], "application/vnd.kahootz": ["ktz", "ktr"], "application/vnd.kde.karbon": ["karbon"], "application/vnd.kde.kchart": ["chrt"], "application/vnd.kde.kformula": ["kfo"], "application/vnd.kde.kivio": ["flw"], "application/vnd.kde.kontour": ["kon"], "application/vnd.kde.kpresenter": ["kpr", "kpt"], "application/vnd.kde.kspread": ["ksp"], "application/vnd.kde.kword": ["kwd", "kwt"], "application/vnd.kenameaapp": ["htke"], "application/vnd.kidspiration": ["kia"], "application/vnd.kinar": ["kne", "knp"], "application/vnd.koan": ["skp", "skd", "skt", "skm"], "application/vnd.kodak-descriptor": ["sse"], "application/vnd.las.las+xml": ["lasxml"], "application/vnd.llamagraphics.life-balance.desktop": ["lbd"], "application/vnd.llamagraphics.life-balance.exchange+xml": ["lbe"], "application/vnd.lotus-1-2-3": ["123"], "application/vnd.lotus-approach": ["apr"], "application/vnd.lotus-freelance": ["pre"], "application/vnd.lotus-notes": ["nsf"], "application/vnd.lotus-organizer": ["org"], "application/vnd.lotus-screencam": ["scm"], "application/vnd.lotus-wordpro": ["lwp"], "application/vnd.macports.portpkg": ["portpkg"], "application/vnd.mapbox-vector-tile": ["mvt"], "application/vnd.mcd": ["mcd"], "application/vnd.medcalcdata": ["mc1"], "application/vnd.mediastation.cdkey": ["cdkey"], "application/vnd.mfer": ["mwf"], "application/vnd.mfmp": ["mfm"], "application/vnd.micrografx.flo": ["flo"], "application/vnd.micrografx.igx": ["igx"], "application/vnd.mif": ["mif"], "application/vnd.mobius.daf": ["daf"], "application/vnd.mobius.dis": ["dis"], "application/vnd.mobius.mbk": ["mbk"], "application/vnd.mobius.mqy": ["mqy"], "application/vnd.mobius.msl": ["msl"], "application/vnd.mobius.plc": ["plc"], "application/vnd.mobius.txf": ["txf"], "application/vnd.mophun.application": ["mpn"], "application/vnd.mophun.certificate": ["mpc"], "application/vnd.mozilla.xul+xml": ["xul"], "application/vnd.ms-artgalry": ["cil"], "application/vnd.ms-cab-compressed": ["cab"], "application/vnd.ms-excel": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"], "application/vnd.ms-excel.addin.macroenabled.12": ["xlam"], "application/vnd.ms-excel.sheet.binary.macroenabled.12": ["xlsb"], "application/vnd.ms-excel.sheet.macroenabled.12": ["xlsm"], "application/vnd.ms-excel.template.macroenabled.12": ["xltm"], "application/vnd.ms-fontobject": ["eot"], "application/vnd.ms-htmlhelp": ["chm"], "application/vnd.ms-ims": ["ims"], "application/vnd.ms-lrm": ["lrm"], "application/vnd.ms-officetheme": ["thmx"], "application/vnd.ms-outlook": ["msg"], "application/vnd.ms-pki.seccat": ["cat"], "application/vnd.ms-pki.stl": ["*stl"], "application/vnd.ms-powerpoint": ["ppt", "pps", "pot"], "application/vnd.ms-powerpoint.addin.macroenabled.12": ["ppam"], "application/vnd.ms-powerpoint.presentation.macroenabled.12": ["pptm"], "application/vnd.ms-powerpoint.slide.macroenabled.12": ["sldm"], "application/vnd.ms-powerpoint.slideshow.macroenabled.12": ["ppsm"], "application/vnd.ms-powerpoint.template.macroenabled.12": ["potm"], "application/vnd.ms-project": ["mpp", "mpt"], "application/vnd.ms-word.document.macroenabled.12": ["docm"], "application/vnd.ms-word.template.macroenabled.12": ["dotm"], "application/vnd.ms-works": ["wps", "wks", "wcm", "wdb"], "application/vnd.ms-wpl": ["wpl"], "application/vnd.ms-xpsdocument": ["xps"], "application/vnd.mseq": ["mseq"], "application/vnd.musician": ["mus"], "application/vnd.muvee.style": ["msty"], "application/vnd.mynfc": ["taglet"], "application/vnd.neurolanguage.nlu": ["nlu"], "application/vnd.nitf": ["ntf", "nitf"], "application/vnd.noblenet-directory": ["nnd"], "application/vnd.noblenet-sealer": ["nns"], "application/vnd.noblenet-web": ["nnw"], "application/vnd.nokia.n-gage.ac+xml": ["*ac"], "application/vnd.nokia.n-gage.data": ["ngdat"], "application/vnd.nokia.n-gage.symbian.install": ["n-gage"], "application/vnd.nokia.radio-preset": ["rpst"], "application/vnd.nokia.radio-presets": ["rpss"], "application/vnd.novadigm.edm": ["edm"], "application/vnd.novadigm.edx": ["edx"], "application/vnd.novadigm.ext": ["ext"], "application/vnd.oasis.opendocument.chart": ["odc"], "application/vnd.oasis.opendocument.chart-template": ["otc"], "application/vnd.oasis.opendocument.database": ["odb"], "application/vnd.oasis.opendocument.formula": ["odf"], "application/vnd.oasis.opendocument.formula-template": ["odft"], "application/vnd.oasis.opendocument.graphics": ["odg"], "application/vnd.oasis.opendocument.graphics-template": ["otg"], "application/vnd.oasis.opendocument.image": ["odi"], "application/vnd.oasis.opendocument.image-template": ["oti"], "application/vnd.oasis.opendocument.presentation": ["odp"], "application/vnd.oasis.opendocument.presentation-template": ["otp"], "application/vnd.oasis.opendocument.spreadsheet": ["ods"], "application/vnd.oasis.opendocument.spreadsheet-template": ["ots"], "application/vnd.oasis.opendocument.text": ["odt"], "application/vnd.oasis.opendocument.text-master": ["odm"], "application/vnd.oasis.opendocument.text-template": ["ott"], "application/vnd.oasis.opendocument.text-web": ["oth"], "application/vnd.olpc-sugar": ["xo"], "application/vnd.oma.dd2+xml": ["dd2"], "application/vnd.openblox.game+xml": ["obgx"], "application/vnd.openofficeorg.extension": ["oxt"], "application/vnd.openstreetmap.data+xml": ["osm"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["pptx"], "application/vnd.openxmlformats-officedocument.presentationml.slide": ["sldx"], "application/vnd.openxmlformats-officedocument.presentationml.slideshow": ["ppsx"], "application/vnd.openxmlformats-officedocument.presentationml.template": ["potx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"], "application/vnd.openxmlformats-officedocument.spreadsheetml.template": ["xltx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"], "application/vnd.openxmlformats-officedocument.wordprocessingml.template": ["dotx"], "application/vnd.osgeo.mapguide.package": ["mgp"], "application/vnd.osgi.dp": ["dp"], "application/vnd.osgi.subsystem": ["esa"], "application/vnd.palm": ["pdb", "pqa", "oprc"], "application/vnd.pawaafile": ["paw"], "application/vnd.pg.format": ["str"], "application/vnd.pg.osasli": ["ei6"], "application/vnd.picsel": ["efif"], "application/vnd.pmi.widget": ["wg"], "application/vnd.pocketlearn": ["plf"], "application/vnd.powerbuilder6": ["pbd"], "application/vnd.previewsystems.box": ["box"], "application/vnd.proteus.magazine": ["mgz"], "application/vnd.publishare-delta-tree": ["qps"], "application/vnd.pvi.ptid1": ["ptid"], "application/vnd.quark.quarkxpress": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"], "application/vnd.rar": ["rar"], "application/vnd.realvnc.bed": ["bed"], "application/vnd.recordare.musicxml": ["mxl"], "application/vnd.recordare.musicxml+xml": ["musicxml"], "application/vnd.rig.cryptonote": ["cryptonote"], "application/vnd.rim.cod": ["cod"], "application/vnd.rn-realmedia": ["rm"], "application/vnd.rn-realmedia-vbr": ["rmvb"], "application/vnd.route66.link66+xml": ["link66"], "application/vnd.sailingtracker.track": ["st"], "application/vnd.seemail": ["see"], "application/vnd.sema": ["sema"], "application/vnd.semd": ["semd"], "application/vnd.semf": ["semf"], "application/vnd.shana.informed.formdata": ["ifm"], "application/vnd.shana.informed.formtemplate": ["itp"], "application/vnd.shana.informed.interchange": ["iif"], "application/vnd.shana.informed.package": ["ipk"], "application/vnd.simtech-mindmapper": ["twd", "twds"], "application/vnd.smaf": ["mmf"], "application/vnd.smart.teacher": ["teacher"], "application/vnd.software602.filler.form+xml": ["fo"], "application/vnd.solent.sdkm+xml": ["sdkm", "sdkd"], "application/vnd.spotfire.dxp": ["dxp"], "application/vnd.spotfire.sfs": ["sfs"], "application/vnd.stardivision.calc": ["sdc"], "application/vnd.stardivision.draw": ["sda"], "application/vnd.stardivision.impress": ["sdd"], "application/vnd.stardivision.math": ["smf"], "application/vnd.stardivision.writer": ["sdw", "vor"], "application/vnd.stardivision.writer-global": ["sgl"], "application/vnd.stepmania.package": ["smzip"], "application/vnd.stepmania.stepchart": ["sm"], "application/vnd.sun.wadl+xml": ["wadl"], "application/vnd.sun.xml.calc": ["sxc"], "application/vnd.sun.xml.calc.template": ["stc"], "application/vnd.sun.xml.draw": ["sxd"], "application/vnd.sun.xml.draw.template": ["std"], "application/vnd.sun.xml.impress": ["sxi"], "application/vnd.sun.xml.impress.template": ["sti"], "application/vnd.sun.xml.math": ["sxm"], "application/vnd.sun.xml.writer": ["sxw"], "application/vnd.sun.xml.writer.global": ["sxg"], "application/vnd.sun.xml.writer.template": ["stw"], "application/vnd.sus-calendar": ["sus", "susp"], "application/vnd.svd": ["svd"], "application/vnd.symbian.install": ["sis", "sisx"], "application/vnd.syncml+xml": ["xsm"], "application/vnd.syncml.dm+wbxml": ["bdm"], "application/vnd.syncml.dm+xml": ["xdm"], "application/vnd.syncml.dmddf+xml": ["ddf"], "application/vnd.tao.intent-module-archive": ["tao"], "application/vnd.tcpdump.pcap": ["pcap", "cap", "dmp"], "application/vnd.tmobile-livetv": ["tmo"], "application/vnd.trid.tpt": ["tpt"], "application/vnd.triscape.mxs": ["mxs"], "application/vnd.trueapp": ["tra"], "application/vnd.ufdl": ["ufd", "ufdl"], "application/vnd.uiq.theme": ["utz"], "application/vnd.umajin": ["umj"], "application/vnd.unity": ["unityweb"], "application/vnd.uoml+xml": ["uoml"], "application/vnd.vcx": ["vcx"], "application/vnd.visio": ["vsd", "vst", "vss", "vsw"], "application/vnd.visionary": ["vis"], "application/vnd.vsf": ["vsf"], "application/vnd.wap.wbxml": ["wbxml"], "application/vnd.wap.wmlc": ["wmlc"], "application/vnd.wap.wmlscriptc": ["wmlsc"], "application/vnd.webturbo": ["wtb"], "application/vnd.wolfram.player": ["nbp"], "application/vnd.wordperfect": ["wpd"], "application/vnd.wqd": ["wqd"], "application/vnd.wt.stf": ["stf"], "application/vnd.xara": ["xar"], "application/vnd.xfdl": ["xfdl"], "application/vnd.yamaha.hv-dic": ["hvd"], "application/vnd.yamaha.hv-script": ["hvs"], "application/vnd.yamaha.hv-voice": ["hvp"], "application/vnd.yamaha.openscoreformat": ["osf"], "application/vnd.yamaha.openscoreformat.osfpvg+xml": ["osfpvg"], "application/vnd.yamaha.smaf-audio": ["saf"], "application/vnd.yamaha.smaf-phrase": ["spf"], "application/vnd.yellowriver-custom-menu": ["cmp"], "application/vnd.zul": ["zir", "zirz"], "application/vnd.zzazz.deck+xml": ["zaz"], "application/x-7z-compressed": ["7z"], "application/x-abiword": ["abw"], "application/x-ace-compressed": ["ace"], "application/x-apple-diskimage": ["*dmg"], "application/x-arj": ["arj"], "application/x-authorware-bin": ["aab", "x32", "u32", "vox"], "application/x-authorware-map": ["aam"], "application/x-authorware-seg": ["aas"], "application/x-bcpio": ["bcpio"], "application/x-bdoc": ["*bdoc"], "application/x-bittorrent": ["torrent"], "application/x-blorb": ["blb", "blorb"], "application/x-bzip": ["bz"], "application/x-bzip2": ["bz2", "boz"], "application/x-cbr": ["cbr", "cba", "cbt", "cbz", "cb7"], "application/x-cdlink": ["vcd"], "application/x-cfs-compressed": ["cfs"], "application/x-chat": ["chat"], "application/x-chess-pgn": ["pgn"], "application/x-chrome-extension": ["crx"], "application/x-cocoa": ["cco"], "application/x-conference": ["nsc"], "application/x-cpio": ["cpio"], "application/x-csh": ["csh"], "application/x-debian-package": ["*deb", "udeb"], "application/x-dgc-compressed": ["dgc"], "application/x-director": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"], "application/x-doom": ["wad"], "application/x-dtbncx+xml": ["ncx"], "application/x-dtbook+xml": ["dtb"], "application/x-dtbresource+xml": ["res"], "application/x-dvi": ["dvi"], "application/x-envoy": ["evy"], "application/x-eva": ["eva"], "application/x-font-bdf": ["bdf"], "application/x-font-ghostscript": ["gsf"], "application/x-font-linux-psf": ["psf"], "application/x-font-pcf": ["pcf"], "application/x-font-snf": ["snf"], "application/x-font-type1": ["pfa", "pfb", "pfm", "afm"], "application/x-freearc": ["arc"], "application/x-futuresplash": ["spl"], "application/x-gca-compressed": ["gca"], "application/x-glulx": ["ulx"], "application/x-gnumeric": ["gnumeric"], "application/x-gramps-xml": ["gramps"], "application/x-gtar": ["gtar"], "application/x-hdf": ["hdf"], "application/x-httpd-php": ["php"], "application/x-install-instructions": ["install"], "application/x-iso9660-image": ["*iso"], "application/x-iwork-keynote-sffkey": ["*key"], "application/x-iwork-numbers-sffnumbers": ["*numbers"], "application/x-iwork-pages-sffpages": ["*pages"], "application/x-java-archive-diff": ["jardiff"], "application/x-java-jnlp-file": ["jnlp"], "application/x-keepass2": ["kdbx"], "application/x-latex": ["latex"], "application/x-lua-bytecode": ["luac"], "application/x-lzh-compressed": ["lzh", "lha"], "application/x-makeself": ["run"], "application/x-mie": ["mie"], "application/x-mobipocket-ebook": ["prc", "mobi"], "application/x-ms-application": ["application"], "application/x-ms-shortcut": ["lnk"], "application/x-ms-wmd": ["wmd"], "application/x-ms-wmz": ["wmz"], "application/x-ms-xbap": ["xbap"], "application/x-msaccess": ["mdb"], "application/x-msbinder": ["obd"], "application/x-mscardfile": ["crd"], "application/x-msclip": ["clp"], "application/x-msdos-program": ["*exe"], "application/x-msdownload": ["*exe", "*dll", "com", "bat", "*msi"], "application/x-msmediaview": ["mvb", "m13", "m14"], "application/x-msmetafile": ["*wmf", "*wmz", "*emf", "emz"], "application/x-msmoney": ["mny"], "application/x-mspublisher": ["pub"], "application/x-msschedule": ["scd"], "application/x-msterminal": ["trm"], "application/x-mswrite": ["wri"], "application/x-netcdf": ["nc", "cdf"], "application/x-ns-proxy-autoconfig": ["pac"], "application/x-nzb": ["nzb"], "application/x-perl": ["pl", "pm"], "application/x-pilot": ["*prc", "*pdb"], "application/x-pkcs12": ["p12", "pfx"], "application/x-pkcs7-certificates": ["p7b", "spc"], "application/x-pkcs7-certreqresp": ["p7r"], "application/x-rar-compressed": ["*rar"], "application/x-redhat-package-manager": ["rpm"], "application/x-research-info-systems": ["ris"], "application/x-sea": ["sea"], "application/x-sh": ["sh"], "application/x-shar": ["shar"], "application/x-shockwave-flash": ["swf"], "application/x-silverlight-app": ["xap"], "application/x-sql": ["sql"], "application/x-stuffit": ["sit"], "application/x-stuffitx": ["sitx"], "application/x-subrip": ["srt"], "application/x-sv4cpio": ["sv4cpio"], "application/x-sv4crc": ["sv4crc"], "application/x-t3vm-image": ["t3"], "application/x-tads": ["gam"], "application/x-tar": ["tar"], "application/x-tcl": ["tcl", "tk"], "application/x-tex": ["tex"], "application/x-tex-tfm": ["tfm"], "application/x-texinfo": ["texinfo", "texi"], "application/x-tgif": ["*obj"], "application/x-ustar": ["ustar"], "application/x-virtualbox-hdd": ["hdd"], "application/x-virtualbox-ova": ["ova"], "application/x-virtualbox-ovf": ["ovf"], "application/x-virtualbox-vbox": ["vbox"], "application/x-virtualbox-vbox-extpack": ["vbox-extpack"], "application/x-virtualbox-vdi": ["vdi"], "application/x-virtualbox-vhd": ["vhd"], "application/x-virtualbox-vmdk": ["vmdk"], "application/x-wais-source": ["src"], "application/x-web-app-manifest+json": ["webapp"], "application/x-x509-ca-cert": ["der", "crt", "pem"], "application/x-xfig": ["fig"], "application/x-xliff+xml": ["*xlf"], "application/x-xpinstall": ["xpi"], "application/x-xz": ["xz"], "application/x-zmachine": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"], "audio/vnd.dece.audio": ["uva", "uvva"], "audio/vnd.digital-winds": ["eol"], "audio/vnd.dra": ["dra"], "audio/vnd.dts": ["dts"], "audio/vnd.dts.hd": ["dtshd"], "audio/vnd.lucent.voice": ["lvp"], "audio/vnd.ms-playready.media.pya": ["pya"], "audio/vnd.nuera.ecelp4800": ["ecelp4800"], "audio/vnd.nuera.ecelp7470": ["ecelp7470"], "audio/vnd.nuera.ecelp9600": ["ecelp9600"], "audio/vnd.rip": ["rip"], "audio/x-aac": ["aac"], "audio/x-aiff": ["aif", "aiff", "aifc"], "audio/x-caf": ["caf"], "audio/x-flac": ["flac"], "audio/x-m4a": ["*m4a"], "audio/x-matroska": ["mka"], "audio/x-mpegurl": ["m3u"], "audio/x-ms-wax": ["wax"], "audio/x-ms-wma": ["wma"], "audio/x-pn-realaudio": ["ram", "ra"], "audio/x-pn-realaudio-plugin": ["rmp"], "audio/x-realaudio": ["*ra"], "audio/x-wav": ["*wav"], "chemical/x-cdx": ["cdx"], "chemical/x-cif": ["cif"], "chemical/x-cmdf": ["cmdf"], "chemical/x-cml": ["cml"], "chemical/x-csml": ["csml"], "chemical/x-xyz": ["xyz"], "image/prs.btif": ["btif"], "image/prs.pti": ["pti"], "image/vnd.adobe.photoshop": ["psd"], "image/vnd.airzip.accelerator.azv": ["azv"], "image/vnd.dece.graphic": ["uvi", "uvvi", "uvg", "uvvg"], "image/vnd.djvu": ["djvu", "djv"], "image/vnd.dvb.subtitle": ["*sub"], "image/vnd.dwg": ["dwg"], "image/vnd.dxf": ["dxf"], "image/vnd.fastbidsheet": ["fbs"], "image/vnd.fpx": ["fpx"], "image/vnd.fst": ["fst"], "image/vnd.fujixerox.edmics-mmr": ["mmr"], "image/vnd.fujixerox.edmics-rlc": ["rlc"], "image/vnd.microsoft.icon": ["ico"], "image/vnd.ms-dds": ["dds"], "image/vnd.ms-modi": ["mdi"], "image/vnd.ms-photo": ["wdp"], "image/vnd.net-fpx": ["npx"], "image/vnd.pco.b16": ["b16"], "image/vnd.tencent.tap": ["tap"], "image/vnd.valve.source.texture": ["vtf"], "image/vnd.wap.wbmp": ["wbmp"], "image/vnd.xiff": ["xif"], "image/vnd.zbrush.pcx": ["pcx"], "image/x-3ds": ["3ds"], "image/x-cmu-raster": ["ras"], "image/x-cmx": ["cmx"], "image/x-freehand": ["fh", "fhc", "fh4", "fh5", "fh7"], "image/x-icon": ["*ico"], "image/x-jng": ["jng"], "image/x-mrsid-image": ["sid"], "image/x-ms-bmp": ["*bmp"], "image/x-pcx": ["*pcx"], "image/x-pict": ["pic", "pct"], "image/x-portable-anymap": ["pnm"], "image/x-portable-bitmap": ["pbm"], "image/x-portable-graymap": ["pgm"], "image/x-portable-pixmap": ["ppm"], "image/x-rgb": ["rgb"], "image/x-tga": ["tga"], "image/x-xbitmap": ["xbm"], "image/x-xpixmap": ["xpm"], "image/x-xwindowdump": ["xwd"], "message/vnd.wfa.wsc": ["wsc"], "model/vnd.collada+xml": ["dae"], "model/vnd.dwf": ["dwf"], "model/vnd.gdl": ["gdl"], "model/vnd.gtw": ["gtw"], "model/vnd.mts": ["mts"], "model/vnd.opengex": ["ogex"], "model/vnd.parasolid.transmit.binary": ["x_b"], "model/vnd.parasolid.transmit.text": ["x_t"], "model/vnd.sap.vds": ["vds"], "model/vnd.usdz+zip": ["usdz"], "model/vnd.valve.source.compiled-map": ["bsp"], "model/vnd.vtu": ["vtu"], "text/prs.lines.tag": ["dsc"], "text/vnd.curl": ["curl"], "text/vnd.curl.dcurl": ["dcurl"], "text/vnd.curl.mcurl": ["mcurl"], "text/vnd.curl.scurl": ["scurl"], "text/vnd.dvb.subtitle": ["sub"], "text/vnd.fly": ["fly"], "text/vnd.fmi.flexstor": ["flx"], "text/vnd.graphviz": ["gv"], "text/vnd.in3d.3dml": ["3dml"], "text/vnd.in3d.spot": ["spot"], "text/vnd.sun.j2me.app-descriptor": ["jad"], "text/vnd.wap.wml": ["wml"], "text/vnd.wap.wmlscript": ["wmls"], "text/x-asm": ["s", "asm"], "text/x-c": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"], "text/x-component": ["htc"], "text/x-fortran": ["f", "for", "f77", "f90"], "text/x-handlebars-template": ["hbs"], "text/x-java-source": ["java"], "text/x-lua": ["lua"], "text/x-markdown": ["mkd"], "text/x-nfo": ["nfo"], "text/x-opml": ["opml"], "text/x-org": ["*org"], "text/x-pascal": ["p", "pas"], "text/x-processing": ["pde"], "text/x-sass": ["sass"], "text/x-scss": ["scss"], "text/x-setext": ["etx"], "text/x-sfv": ["sfv"], "text/x-suse-ymp": ["ymp"], "text/x-uuencode": ["uu"], "text/x-vcalendar": ["vcs"], "text/x-vcard": ["vcf"], "video/vnd.dece.hd": ["uvh", "uvvh"], "video/vnd.dece.mobile": ["uvm", "uvvm"], "video/vnd.dece.pd": ["uvp", "uvvp"], "video/vnd.dece.sd": ["uvs", "uvvs"], "video/vnd.dece.video": ["uvv", "uvvv"], "video/vnd.dvb.file": ["dvb"], "video/vnd.fvt": ["fvt"], "video/vnd.mpegurl": ["mxu", "m4u"], "video/vnd.ms-playready.media.pyv": ["pyv"], "video/vnd.uvvu.mp4": ["uvu", "uvvu"], "video/vnd.vivo": ["viv"], "video/x-f4v": ["f4v"], "video/x-fli": ["fli"], "video/x-flv": ["flv"], "video/x-m4v": ["m4v"], "video/x-matroska": ["mkv", "mk3d", "mks"], "video/x-mng": ["mng"], "video/x-ms-asf": ["asf", "asx"], "video/x-ms-vob": ["vob"], "video/x-ms-wm": ["wm"], "video/x-ms-wmv": ["wmv"], "video/x-ms-wmx": ["wmx"], "video/x-ms-wvx": ["wvx"], "video/x-msvideo": ["avi"], "video/x-sgi-movie": ["movie"], "video/x-smv": ["smv"], "x-conference/x-cooltalk": ["ice"] };
  }
});

// node_modules/mime/index.js
var require_mime = __commonJS({
  "node_modules/mime/index.js"(exports, module) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var Mime = require_Mime();
    module.exports = new Mime(require_standard(), require_other());
  }
});

// node_modules/@cloudflare/kv-asset-handler/dist/types.js
var require_types = __commonJS({
  "node_modules/@cloudflare/kv-asset-handler/dist/types.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalError = exports.NotFoundError = exports.MethodNotAllowedError = exports.KVError = void 0;
    var KVError = class _KVError extends Error {
      static {
        __name(this, "KVError");
      }
      constructor(message, status = 500) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = _KVError.name;
        this.status = status;
      }
      status;
    };
    exports.KVError = KVError;
    var MethodNotAllowedError = class extends KVError {
      static {
        __name(this, "MethodNotAllowedError");
      }
      constructor(message = `Not a valid request method`, status = 405) {
        super(message, status);
      }
    };
    exports.MethodNotAllowedError = MethodNotAllowedError;
    var NotFoundError = class extends KVError {
      static {
        __name(this, "NotFoundError");
      }
      constructor(message = `Not Found`, status = 404) {
        super(message, status);
      }
    };
    exports.NotFoundError = NotFoundError;
    var InternalError = class extends KVError {
      static {
        __name(this, "InternalError");
      }
      constructor(message = `Internal Error in KV Asset Handler`, status = 500) {
        super(message, status);
      }
    };
    exports.InternalError = InternalError;
  }
});

// node_modules/@cloudflare/kv-asset-handler/dist/index.js
var require_dist = __commonJS({
  "node_modules/@cloudflare/kv-asset-handler/dist/index.js"(exports) {
    "use strict";
    init_strip_cf_connecting_ip_header();
    init_modules_watch_stub();
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || /* @__PURE__ */ function() {
      var ownKeys = /* @__PURE__ */ __name(function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      }, "ownKeys");
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalError = exports.NotFoundError = exports.MethodNotAllowedError = exports.mapRequestToAsset = exports.getAssetFromKV = void 0;
    exports.serveSinglePageApp = serveSinglePageApp;
    var mime = __importStar(require_mime());
    var types_1 = require_types();
    Object.defineProperty(exports, "InternalError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.InternalError;
    }, "get") });
    Object.defineProperty(exports, "MethodNotAllowedError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.MethodNotAllowedError;
    }, "get") });
    Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.NotFoundError;
    }, "get") });
    var defaultCacheControl = {
      browserTTL: null,
      edgeTTL: 2 * 60 * 60 * 24,
      // 2 days
      bypassCache: false
      // do not bypass Cloudflare's cache
    };
    var parseStringAsObject = /* @__PURE__ */ __name((maybeString) => typeof maybeString === "string" ? JSON.parse(maybeString) : maybeString, "parseStringAsObject");
    var getAssetFromKVDefaultOptions = {
      ASSET_NAMESPACE: typeof __STATIC_CONTENT !== "undefined" ? __STATIC_CONTENT : void 0,
      ASSET_MANIFEST: typeof __STATIC_CONTENT_MANIFEST !== "undefined" ? parseStringAsObject(__STATIC_CONTENT_MANIFEST) : {},
      cacheControl: defaultCacheControl,
      defaultMimeType: "text/plain",
      defaultDocument: "index.html",
      pathIsEncoded: false,
      defaultETag: "strong"
    };
    function assignOptions(options) {
      return Object.assign({}, getAssetFromKVDefaultOptions, options);
    }
    __name(assignOptions, "assignOptions");
    var mapRequestToAsset = /* @__PURE__ */ __name((request2, options) => {
      options = assignOptions(options);
      const parsedUrl = new URL(request2.url);
      let pathname = parsedUrl.pathname;
      if (pathname.endsWith("/")) {
        pathname = pathname.concat(options.defaultDocument);
      } else if (!mime.getType(pathname)) {
        pathname = pathname.concat("/" + options.defaultDocument);
      }
      parsedUrl.pathname = pathname;
      return new Request(parsedUrl.toString(), request2);
    }, "mapRequestToAsset");
    exports.mapRequestToAsset = mapRequestToAsset;
    function serveSinglePageApp(request2, options) {
      options = assignOptions(options);
      request2 = mapRequestToAsset(request2, options);
      const parsedUrl = new URL(request2.url);
      if (parsedUrl.pathname.endsWith(".html")) {
        return new Request(`${parsedUrl.origin}/${options.defaultDocument}`, request2);
      } else {
        return request2;
      }
    }
    __name(serveSinglePageApp, "serveSinglePageApp");
    var getAssetFromKV2 = /* @__PURE__ */ __name(async (event, options) => {
      options = assignOptions(options);
      const request2 = event.request;
      const ASSET_NAMESPACE = options.ASSET_NAMESPACE;
      const ASSET_MANIFEST = parseStringAsObject(options.ASSET_MANIFEST);
      if (typeof ASSET_NAMESPACE === "undefined") {
        throw new types_1.InternalError(`there is no KV namespace bound to the script`);
      }
      const rawPathKey = new URL(request2.url).pathname.replace(/^\/+/, "");
      let pathIsEncoded = options.pathIsEncoded;
      let requestKey;
      if (options.mapRequestToAsset) {
        requestKey = options.mapRequestToAsset(request2);
      } else if (ASSET_MANIFEST[rawPathKey]) {
        requestKey = request2;
      } else if (ASSET_MANIFEST[decodeURIComponent(rawPathKey)]) {
        pathIsEncoded = true;
        requestKey = request2;
      } else {
        const mappedRequest = mapRequestToAsset(request2);
        const mappedRawPathKey = new URL(mappedRequest.url).pathname.replace(/^\/+/, "");
        if (ASSET_MANIFEST[decodeURIComponent(mappedRawPathKey)]) {
          pathIsEncoded = true;
          requestKey = mappedRequest;
        } else {
          requestKey = mapRequestToAsset(request2, options);
        }
      }
      const SUPPORTED_METHODS = ["GET", "HEAD"];
      if (!SUPPORTED_METHODS.includes(requestKey.method)) {
        throw new types_1.MethodNotAllowedError(`${requestKey.method} is not a valid request method`);
      }
      const parsedUrl = new URL(requestKey.url);
      const pathname = pathIsEncoded ? decodeURIComponent(parsedUrl.pathname) : parsedUrl.pathname;
      let pathKey = pathname.replace(/^\/+/, "");
      const cache = caches.default;
      let mimeType = mime.getType(pathKey) || options.defaultMimeType;
      if (mimeType.startsWith("text") || mimeType === "application/javascript") {
        mimeType += "; charset=utf-8";
      }
      let shouldEdgeCache = false;
      if (typeof ASSET_MANIFEST !== "undefined") {
        if (ASSET_MANIFEST[pathKey]) {
          pathKey = ASSET_MANIFEST[pathKey];
          shouldEdgeCache = true;
        }
      }
      const cacheKey = new Request(`${parsedUrl.origin}/${pathKey}`, request2);
      const evalCacheOpts = (() => {
        switch (typeof options.cacheControl) {
          case "function":
            return options.cacheControl(request2);
          case "object":
            return options.cacheControl;
          default:
            return defaultCacheControl;
        }
      })();
      const formatETag = /* @__PURE__ */ __name((entityId = pathKey, validatorType = options.defaultETag) => {
        if (!entityId) {
          return "";
        }
        switch (validatorType) {
          case "weak":
            if (!entityId.startsWith("W/")) {
              if (entityId.startsWith(`"`) && entityId.endsWith(`"`)) {
                return `W/${entityId}`;
              }
              return `W/"${entityId}"`;
            }
            return entityId;
          case "strong":
            if (entityId.startsWith(`W/"`)) {
              entityId = entityId.replace("W/", "");
            }
            if (!entityId.endsWith(`"`)) {
              entityId = `"${entityId}"`;
            }
            return entityId;
          default:
            return "";
        }
      }, "formatETag");
      options.cacheControl = Object.assign({}, defaultCacheControl, evalCacheOpts);
      if (options.cacheControl.bypassCache || options.cacheControl.edgeTTL === null || request2.method == "HEAD") {
        shouldEdgeCache = false;
      }
      const shouldSetBrowserCache = typeof options.cacheControl.browserTTL === "number";
      let response = null;
      if (shouldEdgeCache) {
        response = await cache.match(cacheKey);
      }
      if (response) {
        if (response.status > 300 && response.status < 400) {
          if (response.body && "cancel" in Object.getPrototypeOf(response.body)) {
            response.body.cancel();
          } else {
          }
          response = new Response(null, response);
        } else {
          const opts = {
            headers: new Headers(response.headers),
            status: 0,
            statusText: ""
          };
          opts.headers.set("cf-cache-status", "HIT");
          if (response.status) {
            opts.status = response.status;
            opts.statusText = response.statusText;
          } else if (opts.headers.has("Content-Range")) {
            opts.status = 206;
            opts.statusText = "Partial Content";
          } else {
            opts.status = 200;
            opts.statusText = "OK";
          }
          response = new Response(response.body, opts);
        }
      } else {
        const body = await ASSET_NAMESPACE.get(pathKey, "arrayBuffer");
        if (body === null) {
          throw new types_1.NotFoundError(`could not find ${pathKey} in your content namespace`);
        }
        response = new Response(body);
        if (shouldEdgeCache) {
          response.headers.set("Accept-Ranges", "bytes");
          response.headers.set("Content-Length", String(body.byteLength));
          if (!response.headers.has("etag")) {
            response.headers.set("etag", formatETag(pathKey));
          }
          response.headers.set("Cache-Control", `max-age=${options.cacheControl.edgeTTL}`);
          event.waitUntil(cache.put(cacheKey, response.clone()));
          response.headers.set("CF-Cache-Status", "MISS");
        }
      }
      response.headers.set("Content-Type", mimeType);
      if (response.status === 304) {
        const etag = formatETag(response.headers.get("etag"));
        const ifNoneMatch = cacheKey.headers.get("if-none-match");
        const proxyCacheStatus = response.headers.get("CF-Cache-Status");
        if (etag) {
          if (ifNoneMatch && ifNoneMatch === etag && proxyCacheStatus === "MISS") {
            response.headers.set("CF-Cache-Status", "EXPIRED");
          } else {
            response.headers.set("CF-Cache-Status", "REVALIDATED");
          }
          response.headers.set("etag", formatETag(etag, "weak"));
        }
      }
      if (shouldSetBrowserCache) {
        response.headers.set("Cache-Control", `max-age=${options.cacheControl.browserTTL}`);
      } else {
        response.headers.delete("Cache-Control");
      }
      return response;
    }, "getAssetFromKV");
    exports.getAssetFromKV = getAssetFromKV2;
  }
});

// .wrangler/tmp/bundle-0o26pU/middleware-loader.entry.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// .wrangler/tmp/bundle-0o26pU/middleware-insertion-facade.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();

// src/index.js
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var import_kv_asset_handler = __toESM(require_dist());
async function serveStaticAsset(request2, env) {
  const url = new URL(request2.url);
  let path = url.pathname;
  if (path === "/" || path === "") {
    path = "/index.html";
  }
  const contentTypeMap = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml"
  };
  const ext = path.includes(".") ? path.substring(path.lastIndexOf(".")) : "";
  const contentType = contentTypeMap[ext] || "text/plain";
  try {
    if (path === "/index.html" || path === "/") {
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>\u6709\u6548\u4EE3\u7406\u5217\u8868</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        /* \u5237\u65B0\u6309\u94AE\u65CB\u8F6C\u52A8\u753B */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .bi-arrow-clockwise-spin {
            animation: spin 1s linear infinite;
        }
        
        /* \u4EE3\u7406\u8868\u683C\u989C\u8272\u548C\u6837\u5F0F */
        .table-success {
            --bs-table-bg: rgba(209, 231, 221, 0.7);
        }
        .table-secondary {
            --bs-table-bg: rgba(233, 236, 239, 0.5);
        }
        .table-warning {
            --bs-table-bg: rgba(255, 243, 205, 0.7);
        }
        
        /* \u81EA\u52A8\u5237\u65B0\u5F00\u5173\u6837\u5F0F */
        .form-switch {
            padding-left: 2.5em;
        }
        .form-check-input {
            cursor: pointer;
        }
        
        /* \u989D\u5916\u7684\u89C6\u89C9\u589E\u5F3A */
        .proxy-recent {
            font-weight: bold;
        }
        .proxy-outdated {
            opacity: 0.7;
        }
        .region-missing {
            font-style: italic;
            color: #dc3545;
        }
    </style>
</head>
<body>
<div class="container mt-5">
    <h1 class="mb-4">\u6709\u6548\u4EE3\u7406\u5217\u8868</h1>
    
    <!-- \u5237\u65B0\u548C\u4FE1\u606F\u533A\u57DF -->
    <div id="status-message" class="alert alert-info">
        \u6B63\u5728\u52A0\u8F7D\u4EE3\u7406\u6570\u636E\uFF0C\u8BF7\u7A0D\u5019...
    </div>
    
    <div class="mb-3 d-flex justify-content-between align-items-center">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="auto-refresh-toggle" checked>
        <label class="form-check-label auto-refresh-status" for="auto-refresh-toggle">
          \uFF08\u81EA\u52A8\u6BCF30\u79D2\u5237\u65B0\u4E00\u6B21\uFF09
        </label>
      </div>
      <button id="refresh-btn" class="btn btn-outline-primary">
        <i class="bi bi-arrow-clockwise"></i> \u7ACB\u5373\u5237\u65B0
      </button>
    </div>
    
    <!-- \u7B5B\u9009\u548C\u5BFC\u51FA\u63A7\u4EF6 -->
    <div class="row mb-3">
      <div class="col">
        <input type="text" id="search-input" placeholder="\u641C\u7D22 IP \u6216 \u5730\u533A" class="form-control" />
      </div>
      <div class="col">
        <select id="filter-region" class="form-select">
          <option value="">\u5168\u90E8\u5730\u533A</option>
        </select>
      </div>
      <div class="col">
        <select id="filter-type" class="form-select">
          <option value="">\u5168\u90E8\u7C7B\u578B</option>
        </select>
      </div>
      <div class="col-auto">
        <button id="export-btn" class="btn btn-primary">\u5BFC\u51FACSV</button>
      </div>
    </div>
    
    <table class="table table-striped" id="proxy-table">
        <thead>
            <tr>
                <th>IP</th>
                <th>\u7AEF\u53E3</th>
                <th>\u7C7B\u578B</th>
                <th>HTTPS</th>
                <th>\u5730\u533A</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    
    <!-- \u5206\u9875\u63A7\u4EF6 -->
    <nav>
        <ul class="pagination justify-content-center" id="pagination"></ul>
    </nav>
    
    <!-- \u989C\u8272\u56FE\u4F8B -->
    <div class="row mt-4">
        <div class="col-12">
            <p class="text-muted small">\u989C\u8272\u56FE\u4F8B\uFF1A</p>
            <div class="d-flex flex-wrap">
                <div class="me-3 mb-2">
                    <span class="badge bg-success">\u7EFF\u8272</span> - HTTPS\u652F\u6301
                </div>
                <div class="me-3 mb-2">
                    <span class="badge bg-secondary">\u7070\u8272</span> - HTTPS\u4E0D\u652F\u6301
                </div>
                <div class="me-3 mb-2">
                    <span class="badge bg-warning text-dark">\u9EC4\u8272</span> - \u672A\u9A8C\u8BC1\u4EE3\u7406
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// \u5D4C\u5165\u7684JavaScript\u4EE3\u7801
let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

// \u5168\u5C40\u53D8\u91CF\uFF0C\u7528\u4E8E\u8DDF\u8E2A\u81EA\u52A8\u5237\u65B0\u72B6\u6001
let autoRefreshInterval = null;
const AUTO_REFRESH_SECONDS = 30;

// \u5F02\u6B65\u52A0\u8F7D\u4EE3\u7406\u6570\u636E
async function loadProxies() {
    const statusElem = document.getElementById('status-message');
    if (statusElem) {
        statusElem.textContent = '\u6B63\u5728\u5237\u65B0\u4EE3\u7406\u6570\u636E...';
        statusElem.style.backgroundColor = '#f8f9fa';
    }
    
    try {
        // \u5F3A\u5236\u7834\u574F\u7F13\u5B58
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const cacheBuster = '?nocache=' + timestamp + '&rand=' + random;
        console.log('\u6B63\u5728\u83B7\u53D6\u4EE3\u7406\u6570\u636E\uFF0C\u8BF7\u6C42URL: /proxies.json' + cacheBuster + '\uFF0C\u65F6\u95F4: ' + new Date().toLocaleTimeString());
        
        const response = await fetch('/proxies.json' + cacheBuster, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store' // \u544A\u8BC9\u6D4F\u89C8\u5668\u4E0D\u8981\u7F13\u5B58
        });
        
        console.log('\u83B7\u53D6\u4EE3\u7406\u6570\u636E\u8BF7\u6C42\u5B8C\u6210, \u65F6\u95F4: ' + new Date().toLocaleTimeString() + ', \u72B6\u6001: ' + response.status);
        
        if (!response.ok) {
            throw new Error('HTTP \u9519\u8BEF: ' + response.status);
        }
        
        const data = await response.json();
        if (data && typeof data === 'object' && data.error) {
            throw new Error(data.message || data.error || '\u672A\u77E5\u9519\u8BEF');
        }
        
        proxies = Array.isArray(data) ? data : [];
        
        // \u7EDF\u8BA1\u4FE1\u606F\u8BA1\u7B97
        const validatedCount = proxies.filter(p => p && p.validated === true).length;
        const withRegionCount = proxies.filter(p => 
            p && p.region && p.region !== '\u672A\u77E5' && p.region !== '\u672A\u68C0\u6D4B' && p.region !== ''
        ).length;
        
        // \u6309\u9A8C\u8BC1\u72B6\u6001\u548C\u65F6\u95F4\u6392\u5E8F
        proxies.sort((a, b) => {
            if ((a.validated === true) && (b.validated !== true)) return -1;
            if ((a.validated !== true) && (b.validated === true)) return 1;
            
            const timeA = a.last_check ? new Date(a.last_check).getTime() : 0;
            const timeB = b.last_check ? new Date(b.last_check).getTime() : 0;
            return timeB - timeA;
        });
        
        filtered = proxies;
        
        if (statusElem) {
            if (proxies.length === 0) {
                statusElem.textContent = '\u5F53\u524D\u6CA1\u6709\u4EE3\u7406\u6570\u636E\uFF0C\u7CFB\u7EDF\u6B63\u5728\u91C7\u96C6\u4E2D\uFF0C\u8BF7\u7A0D\u540E\u5237\u65B0\u9875\u9762';
                statusElem.style.backgroundColor = '#fff3cd';
                return true;
            }
            
            // \u663E\u793A\u6700\u540E\u66F4\u65B0\u65F6\u95F4\u548C\u7EDF\u8BA1
            let lastUpdateTime = '\u672A\u77E5';
            if (proxies[0] && proxies[0].last_check) {
                try {
                    const lastCheckStr = proxies[0].last_check;
                    console.log('\u6536\u5230\u7684\u65F6\u95F4\u6233\u539F\u59CB\u503C:', lastCheckStr);
                    
                    // \u786E\u4FDD\u662F\u6709\u6548\u7684ISO\u683C\u5F0F\u65F6\u95F4\u5B57\u7B26\u4E32
                    const lastCheckDate = new Date(lastCheckStr);
                    
                    // \u68C0\u67E5\u662F\u5426\u662F\u6709\u6548\u65E5\u671F
                    if (isNaN(lastCheckDate.getTime())) {
                        throw new Error('\u65E0\u6548\u7684\u65E5\u671F\u65F6\u95F4\u683C\u5F0F');
                    }
                    
                    // \u683C\u5F0F\u5316\u4E3A\u672C\u5730\u65F6\u95F4\u5B57\u7B26\u4E32
                    lastUpdateTime = lastCheckDate.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false
                    });
                    
                    console.log('\u4EE3\u7406\u66F4\u65B0\u65F6\u95F4\u89E3\u6790\u6210\u529F: ' + lastCheckStr + ' => ' + lastUpdateTime);
                } catch (e) {
                    console.error('\u89E3\u6790\u65F6\u95F4\u6233\u9519\u8BEF:', e);
                    lastUpdateTime = String(proxies[0].last_check);
                }
            }
                
            statusElem.innerHTML = '<div>\u5DF2\u52A0\u8F7D <b>' + proxies.length + '</b> \u4E2A\u4EE3\u7406 (\u6700\u540E\u66F4\u65B0: <b>' + lastUpdateTime + '</b>)</div>' +
                '<div class="small mt-1">\u5DF2\u9A8C\u8BC1: ' + validatedCount + ' \u4E2A | \u6709\u5730\u533A\u4FE1\u606F: ' + withRegionCount + ' \u4E2A</div>';
            statusElem.style.backgroundColor = '#d1e7dd';
        }
        
        populateFilters();
        currentPage = 1;
        renderTable();
        renderPagination();
        return true;
    } catch (err) {
        console.error('\u52A0\u8F7D\u4EE3\u7406\u5931\u8D25:', err);
        if (statusElem) {
            statusElem.textContent = '\u52A0\u8F7D\u4EE3\u7406\u5931\u8D25: ' + err.message + '\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5';
            statusElem.style.backgroundColor = '#f8d7da';
        }
        return false;
    }
}    // \u6E32\u67D3\u8868\u683C\u5185\u5BB9
    function renderTable() {
        const tbody = document.querySelector('#proxy-table tbody');
        tbody.innerHTML = '';
        const start = (currentPage - 1) * pageSize;
        const pageData = filtered.slice(start, start + pageSize);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">\u6682\u65E0\u6570\u636E</td></tr>';
            return;
        }
        
        pageData.forEach(p => {
            // \u683C\u5F0F\u5316\u5730\u533A\u663E\u793A - \u5982\u679C\u683C\u5F0F\u662F "\u56FD\u5BB6/\u7701/\u5E02"\uFF0C\u53EA\u663E\u793A "\u56FD\u5BB6/\u7701"
            let regionDisplay = p.region || '-';
            if (regionDisplay.includes('/')) {
                const parts = regionDisplay.split('/');
                if (parts.length >= 2) {
                    regionDisplay = parts[0] + '/' + parts[1];
                }
            }
        
        // \u6DFB\u52A0\u6837\u5F0F\uFF0C\u7740\u8272\u663E\u793A
        const tr = document.createElement('tr');
        
        // \u6839\u636E\u9A8C\u8BC1\u72B6\u6001\u6DFB\u52A0\u6837\u5F0F
        if (p.validated !== true) {
            tr.classList.add('table-warning'); // \u672A\u9A8C\u8BC1\u7684\u4EE3\u7406\u4F7F\u7528\u8B66\u544A\u8272
        }
        // \u6839\u636EHTTPS\u652F\u6301\u60C5\u51B5\u6DFB\u52A0\u6837\u5F0F\u7C7B
        else if (p.https === '\u652F\u6301') {
            tr.classList.add('table-success');  // \u7EFF\u8272 - HTTPS\u652F\u6301
        } else if (p.https === '\u4E0D\u652F\u6301') {
            tr.classList.add('table-secondary'); // \u7070\u8272 - HTTPS\u4E0D\u652F\u6301
        }
        
        // \u5224\u65AD\u4E0A\u6B21\u68C0\u67E5\u65F6\u95F4\u662F\u5426\u572824\u5C0F\u65F6\u5185
        const now = new Date();
        const lastCheck = p.last_check ? new Date(p.last_check) : null;
        const isRecent = lastCheck && (now - lastCheck < 24 * 60 * 60 * 1000);
        
        // \u5224\u65AD\u662F\u5426\u6709\u5730\u533A\u4FE1\u606F
        const hasRegion = p.region && p.region !== '\u672A\u77E5' && p.region !== '\u672A\u68C0\u6D4B' && p.region !== '';            // \u521B\u5EFA\u5355\u5143\u683C\u5185\u5BB9
            tr.innerHTML = '<td>' + p.ip + '</td>' +
                '<td>' + p.port + '</td>' +
                '<td>' + (p.type || '-') + '</td>' +
                '<td>' + (p.https || '-') + '</td>' +
                '<td class="' + (hasRegion ? 'text-success' : 'text-muted') + '">' +
                    regionDisplay +
                    ((!hasRegion) ? '<small>(\u9700\u66F4\u65B0)</small>' : '') +
                '</td>';
        
        // \u5982\u679C\u4E0D\u662F\u6700\u8FD1\u9A8C\u8BC1\u7684\u4EE3\u7406\uFF0C\u6DFB\u52A0\u6DE1\u8272\u6837\u5F0F
        if (!isRecent) {
            tr.style.opacity = '0.7';
        }
        
        tbody.appendChild(tr);
    });
}    // \u751F\u6210\u5206\u9875\u63A7\u4EF6
    function renderPagination() {
        const totalPages = Math.ceil(filtered.length / pageSize);
        const ul = document.getElementById('pagination');
        ul.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = 'page-item' + (i === currentPage ? ' active' : '');
            li.innerHTML = '<a class="page-link" href="#">' + i + '</a>';
            li.addEventListener('click', e => {
                e.preventDefault();
                currentPage = i;
                renderTable();
                renderPagination();
            });
            ul.appendChild(li);
        }
    }

// \u586B\u5145\u7B5B\u9009\u4E0B\u62C9\u6846
function populateFilters() {
    const regionSet = new Set();
    const typeSet = new Set();
    proxies.forEach(p => {
        if (p.region) regionSet.add(p.region);
        if (p.type) typeSet.add(p.type);
    });
    
    const regionSelect = document.getElementById('filter-region');
    const typeSelect = document.getElementById('filter-type');
    
    // \u4FDD\u7559\u7B2C\u4E00\u4E2A"\u5168\u90E8"\u9009\u9879
    regionSelect.innerHTML = '<option value="">\u5168\u90E8\u5730\u533A</option>';
    typeSelect.innerHTML = '<option value="">\u5168\u90E8\u7C7B\u578B</option>';
    
    Array.from(regionSet).sort().forEach(r => {
        const opt = document.createElement('option'); 
        opt.value = r; 
        opt.textContent = r;
        regionSelect.appendChild(opt);
    });
    
    Array.from(typeSet).sort().forEach(t => {
        const opt = document.createElement('option'); 
        opt.value = t; 
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

// \u5E94\u7528\u7B5B\u9009
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const regionVal = document.getElementById('filter-region').value;
    const typeVal = document.getElementById('filter-type').value;
    
    filtered = proxies.filter(p => {
        const matchSearch = !searchTerm || 
            p.ip.toLowerCase().includes(searchTerm) || 
            (p.region && p.region.toLowerCase().includes(searchTerm));
        const matchRegion = !regionVal || p.region === regionVal;
        const matchType = !typeVal || p.type === typeVal;
        return matchSearch && matchRegion && matchType;
    });
    
    currentPage = 1;
    renderTable();
    renderPagination();
}

// CSV \u5BFC\u51FA\u529F\u80FD
function exportCSV() {
    const headers = ['IP', '\u7AEF\u53E3', '\u7C7B\u578B', 'HTTPS', '\u5730\u533A'];
    const rows = [headers].concat(
        filtered.map(p => [p.ip, p.port, p.type, p.https, p.region])
    );
    const csvContent = rows.map(r => r.map(field => '"' + (field || '') + '"').join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "proxies_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// \u542F\u52A8\u6216\u91CD\u7F6E\u81EA\u52A8\u5237\u65B0\u8BA1\u65F6\u5668
function startAutoRefresh() {
    // \u6E05\u9664\u73B0\u6709\u8BA1\u65F6\u5668
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // \u8BBE\u7F6E\u65B0\u8BA1\u65F6\u5668
    autoRefreshInterval = setInterval(() => {
        const now = new Date();
        console.log("\u81EA\u52A8\u5237\u65B0\u89E6\u53D1 (" + now.toLocaleTimeString() + ")");
        loadProxies().then(success => {
            console.log("\u81EA\u52A8\u5237\u65B0\u5B8C\u6210\uFF0C\u7ED3\u679C: " + (success ? "\u6210\u529F" : "\u5931\u8D25") + ", \u65F6\u95F4: " + new Date().toLocaleTimeString());
        }).catch(err => {
            console.error("\u81EA\u52A8\u5237\u65B0\u51FA\u9519:", err);
        });
    }, AUTO_REFRESH_SECONDS * 1000);
    
    // \u66F4\u65B0UI\u63D0\u793A
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = "\uFF08\u81EA\u52A8\u6BCF" + AUTO_REFRESH_SECONDS + "\u79D2\u5237\u65B0\u4E00\u6B21\uFF09";
    }
}

// \u505C\u6B62\u81EA\u52A8\u5237\u65B0
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // \u66F4\u65B0UI\u63D0\u793A
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = '\uFF08\u81EA\u52A8\u5237\u65B0\u5DF2\u6682\u505C\uFF09';
    }
}

// \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\u5668
document.addEventListener('DOMContentLoaded', () => {
    // \u521D\u59CB\u52A0\u8F7D\u4EE3\u7406\u6570\u636E
    loadProxies().then(() => {
        // \u521D\u59CB\u52A0\u8F7D\u6210\u529F\u540E\u542F\u52A8\u81EA\u52A8\u5237\u65B0
        startAutoRefresh();
    });
    
    // \u7ED1\u5B9A\u7B5B\u9009\u76F8\u5173\u4E8B\u4EF6
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-region').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    
    // \u624B\u52A8\u5237\u65B0\u6309\u94AE\u4E8B\u4EF6
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // \u65CB\u8F6C\u5237\u65B0\u56FE\u6807
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('bi-arrow-clockwise-spin');
            refreshBtn.disabled = true;
            
            // \u624B\u52A8\u5237\u65B0
            loadProxies().finally(() => {
                icon.classList.remove('bi-arrow-clockwise-spin');
                refreshBtn.disabled = false;
                
                // \u91CD\u7F6E\u81EA\u52A8\u5237\u65B0\u8BA1\u65F6\u5668
                if (document.getElementById('auto-refresh-toggle').checked) {
                    startAutoRefresh();
                }
            });
        });
    }
    
    // \u81EA\u52A8\u5237\u65B0\u5F00\u5173
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
});
<\/script>
</body>
</html>`;
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache"
        }
      });
    }
    if (path === "/static/js/main.js") {
      const js = `let proxies = [];
let filtered = [];
let currentPage = 1;
const pageSize = 20;

async function loadProxies() {
    try {
        const response = await fetch('/proxies.json');
        const data = await response.json();
        if (data.error) {
            alert('\u52A0\u8F7D\u4EE3\u7406\u5931\u8D25: ' + (data.message || data.error));
            return;
        }
        
        proxies = Array.isArray(data) ? data : [];
        filtered = proxies;
        renderTable();
    } catch (err) {
        console.error('\u52A0\u8F7D\u4EE3\u7406\u5931\u8D25:', err);
    }
}

function renderTable() {
    const tbody = document.querySelector('#proxy-table tbody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">\u6682\u65E0\u6570\u636E</td></tr>';
        return;
    }
    
    pageData.forEach(p => {
        const tr = document.createElement('tr');
        // \u683C\u5F0F\u5316\u5730\u533A\u663E\u793A - \u5982\u679C\u683C\u5F0F\u662F "\u56FD\u5BB6/\u7701/\u5E02"\uFF0C\u53EA\u663E\u793A "\u56FD\u5BB6/\u7701"
        let regionDisplay = p.region || '-';
        if (regionDisplay.includes('/')) {
            const parts = regionDisplay.split('/');
            if (parts.length >= 2) {
                regionDisplay = parts[0] + '/' + parts[1];
            }
        }
        
        // \u5224\u65AD\u662F\u5426\u6709\u5730\u533A\u4FE1\u606F
        const hasRegion = p.region && p.region !== '\u672A\u77E5' && p.region !== '\u672A\u68C0\u6D4B' && p.region !== '';
        
        // \u5224\u65AD\u4E0A\u6B21\u68C0\u67E5\u65F6\u95F4\u662F\u5426\u572824\u5C0F\u65F6\u5185
        const now = new Date();
        const lastCheck = p.last_check ? new Date(p.last_check) : null;
        const isRecent = lastCheck && (now - lastCheck < 24 * 60 * 60 * 1000);
        
        tr.innerHTML = 
            '<td>' + p.ip + '</td>' +
            '<td>' + p.port + '</td>' +
            '<td>' + (p.type || '-') + '</td>' +
            '<td>' + (p.https || '-') + '</td>' +
            '<td class="' + (hasRegion ? 'text-success' : 'text-muted') + '">' +
                regionDisplay +
                ((!hasRegion) ? '<small>(\u9700\u66F4\u65B0)</small>' : '') +
            '</td>';
        
        // \u5982\u679C\u4E0D\u662F\u6700\u8FD1\u9A8C\u8BC1\u7684\u4EE3\u7406\uFF0C\u6DFB\u52A0\u6DE1\u8272\u6837\u5F0F
        if (!isRecent) {
            tr.style.opacity = '0.7';
        }
        
        tbody.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById('pagination');
    ul.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = '<a class="page-link" href="#">' + i + '</a>';
        li.addEventListener('click', e => {
            e.preventDefault();
            currentPage = i;
            renderTable();
            renderPagination();
        });
        ul.appendChild(li);
    }
}

// \u586B\u5145\u7B5B\u9009\u4E0B\u62C9\u6846
function populateFilters() {
    const regionSet = new Set();
    const typeSet = new Set();
    proxies.forEach(p => {
        if (p.region) regionSet.add(p.region);
        if (p.type) typeSet.add(p.type);
    });
    
    const regionSelect = document.getElementById('filter-region');
    const typeSelect = document.getElementById('filter-type');
    
    // \u4FDD\u7559\u7B2C\u4E00\u4E2A"\u5168\u90E8"\u9009\u9879
    regionSelect.innerHTML = '<option value="">\u5168\u90E8\u5730\u533A</option>';
    typeSelect.innerHTML = '<option value="">\u5168\u90E8\u7C7B\u578B</option>';
    
    Array.from(regionSet).sort().forEach(r => {
        const opt = document.createElement('option'); 
        opt.value = r; 
        opt.textContent = r;
        regionSelect.appendChild(opt);
    });
    
    Array.from(typeSet).sort().forEach(t => {
        const opt = document.createElement('option'); 
        opt.value = t; 
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
}

// \u5E94\u7528\u7B5B\u9009
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const regionVal = document.getElementById('filter-region').value;
    const typeVal = document.getElementById('filter-type').value;
    
    filtered = proxies.filter(p => {
        const matchSearch = !searchTerm || 
            p.ip.toLowerCase().includes(searchTerm) || 
            (p.region && p.region.toLowerCase().includes(searchTerm));
        const matchRegion = !regionVal || p.region === regionVal;
        const matchType = !typeVal || p.type === typeVal;
        return matchSearch && matchRegion && matchType;
    });
    
    currentPage = 1;
    renderTable();
    renderPagination();
}

// CSV \u5BFC\u51FA\u529F\u80FD
function exportCSV() {
    const headers = ['IP', '\u7AEF\u53E3', '\u7C7B\u578B', 'HTTPS', '\u5730\u533A'];
    const rows = [headers].concat(
        filtered.map(p => [p.ip, p.port, p.type, p.https, p.region])
    );
    const csvContent = rows.map(r => r.map(field => '"' + (field || '') + '"').join(',')).join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "proxies_" + Date.now() + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// \u542F\u52A8\u6216\u91CD\u7F6E\u81EA\u52A8\u5237\u65B0\u8BA1\u65F6\u5668
function startAutoRefresh() {
    // \u6E05\u9664\u73B0\u6709\u8BA1\u65F6\u5668
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // \u8BBE\u7F6E\u65B0\u8BA1\u65F6\u5668
    autoRefreshInterval = setInterval(() => {
        const now = new Date();
        console.log("\u81EA\u52A8\u5237\u65B0\u89E6\u53D1 (" + now.toLocaleTimeString() + ")");
        loadProxies().then(success => {
            console.log("\u81EA\u52A8\u5237\u65B0\u5B8C\u6210\uFF0C\u7ED3\u679C: " + (success ? "\u6210\u529F" : "\u5931\u8D25") + ", \u65F6\u95F4: " + new Date().toLocaleTimeString());
        }).catch(err => {
            console.error("\u81EA\u52A8\u5237\u65B0\u51FA\u9519:", err);
        });
    }, AUTO_REFRESH_SECONDS * 1000);
    
    // \u66F4\u65B0UI\u63D0\u793A
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = "\uFF08\u81EA\u52A8\u6BCF" + AUTO_REFRESH_SECONDS + "\u79D2\u5237\u65B0\u4E00\u6B21\uFF09";
    }
}

// \u505C\u6B62\u81EA\u52A8\u5237\u65B0
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
    
    // \u66F4\u65B0UI\u63D0\u793A
    const autoRefreshSpan = document.querySelector('.auto-refresh-status');
    if (autoRefreshSpan) {
        autoRefreshSpan.textContent = '\uFF08\u81EA\u52A8\u5237\u65B0\u5DF2\u6682\u505C\uFF09';
    }
}

// \u6DFB\u52A0\u4E8B\u4EF6\u76D1\u542C\u5668
document.addEventListener('DOMContentLoaded', () => {
    // \u521D\u59CB\u52A0\u8F7D\u4EE3\u7406\u6570\u636E
    loadProxies().then(() => {
        // \u521D\u59CB\u52A0\u8F7D\u6210\u529F\u540E\u542F\u52A8\u81EA\u52A8\u5237\u65B0
        startAutoRefresh();
    });
    
    // \u7ED1\u5B9A\u7B5B\u9009\u76F8\u5173\u4E8B\u4EF6
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-region').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    
    // \u624B\u52A8\u5237\u65B0\u6309\u94AE\u4E8B\u4EF6
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // \u65CB\u8F6C\u5237\u65B0\u56FE\u6807
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('bi-arrow-clockwise-spin');
            refreshBtn.disabled = true;
            
            // \u624B\u52A8\u5237\u65B0
            loadProxies().finally(() => {
                icon.classList.remove('bi-arrow-clockwise-spin');
                refreshBtn.disabled = false;
                
                // \u91CD\u7F6E\u81EA\u52A8\u5237\u65B0\u8BA1\u65F6\u5668
                if (document.getElementById('auto-refresh-toggle').checked) {
                    startAutoRefresh();
                }
            });
        });
    }
    
    // \u81EA\u52A8\u5237\u65B0\u5F00\u5173
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', function() {
            if (this.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        });
    }
});
<\/script>
</body>
</html>`;
      return new Response(js, {
        headers: { "Content-Type": "application/javascript" }
      });
    }
    return new Response("Not Found", { status: 404 });
  } catch (e) {
    return new Response("\u9759\u6001\u8D44\u6E90\u9519\u8BEF: " + e.message, { status: 500 });
  }
}
__name(serveStaticAsset, "serveStaticAsset");
var src_default = {
  async fetch(request2, env, ctx) {
    try {
      const url = new URL(request2.url);
      if (url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }
      if (url.pathname === "/proxies.json") {
        try {
          if (!env.proxyworker) {
            console.error("proxyworker KV \u547D\u540D\u7A7A\u95F4\u672A\u7ED1\u5B9A!");
            return new Response(JSON.stringify({
              error: "KV\u5B58\u50A8\u672A\u914D\u7F6E",
              message: "\u7CFB\u7EDF\u6682\u65F6\u65E0\u6CD5\u63D0\u4F9B\u4EE3\u7406\u6570\u636E"
            }), {
              status: 503,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
              }
            });
          }
          try {
            const data = await env.proxyworker.get("list");
            return new Response(data || "[]", {
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Access-Control-Allow-Origin": "*"
              }
            });
          } catch (kvError) {
            console.error("\u4ECEKV\u8BFB\u53D6\u6570\u636E\u5931\u8D25:", kvError);
            return new Response(JSON.stringify({
              error: "KV\u8BFB\u53D6\u5931\u8D25",
              message: "\u65E0\u6CD5\u4ECEKV\u5B58\u50A8\u8BFB\u53D6\u6570\u636E: " + kvError.message
            }), {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            });
          }
        } catch (err) {
          console.error("\u83B7\u53D6\u4EE3\u7406\u6570\u636E\u51FA\u9519:", err);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
      try {
        return await (0, import_kv_asset_handler.getAssetFromKV)(
          {
            request: request2,
            waitUntil: ctx.waitUntil.bind(ctx),
            env
          },
          {
            mapRequestToAsset: /* @__PURE__ */ __name((req) => {
              const parsedUrl = new URL(req.url);
              if (parsedUrl.pathname === "/") {
                parsedUrl.pathname = "/index.html";
              }
              return new Request(parsedUrl.toString(), req);
            }, "mapRequestToAsset")
          }
        );
      } catch (e) {
        console.log("getAssetFromKV\u5931\u8D25:", e);
        try {
          if (env.__STATIC_CONTENT) {
            return await (0, import_kv_asset_handler.getAssetFromKV)(
              {
                request: request2,
                waitUntil: ctx.waitUntil.bind(ctx),
                env: { __STATIC_CONTENT: env.__STATIC_CONTENT }
              },
              {
                mapRequestToAsset: /* @__PURE__ */ __name((req) => {
                  const parsedUrl = new URL(req.url);
                  if (parsedUrl.pathname === "/") {
                    parsedUrl.pathname = "/index.html";
                  }
                  return new Request(parsedUrl.toString(), req);
                }, "mapRequestToAsset")
              }
            );
          }
        } catch (e2) {
          console.log("\u7B2C\u4E8C\u6B21getAssetFromKV\u5931\u8D25:", e2);
        }
        return await serveStaticAsset(request2, env);
      }
    } catch (e) {
      console.error("Worker\u5168\u5C40\u9519\u8BEF:", e);
      return new Response("\u670D\u52A1\u9519\u8BEF: " + e.message, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  },
  async scheduled(event, env, ctx) {
    console.log("\u5F00\u59CB\u6267\u884C\u5B9A\u65F6\u4EFB\u52A1\uFF1A\u83B7\u53D6\u4EE3\u7406\u5217\u8868 (\u89E6\u53D1\u65F6\u95F4: " + (/* @__PURE__ */ new Date()).toISOString() + ")");
    try {
      await fetchAndStore(env);
      console.log("\u5B9A\u65F6\u4EFB\u52A1\u6267\u884C\u5B8C\u6210");
    } catch (e) {
      console.error("\u5B9A\u65F6\u4EFB\u52A1\u6267\u884C\u5931\u8D25:", e);
    }
  }
};
async function fetchAndStore(env) {
  try {
    if (!env.proxyworker) {
      console.error("\u65E0\u6CD5\u6267\u884C\u5B9A\u65F6\u4EFB\u52A1\uFF1Aproxyworker KV \u547D\u540D\u7A7A\u95F4\u672A\u7ED1\u5B9A!");
      return;
    }
    console.log("\u5F00\u59CB\u8BFB\u53D6\u6700\u65B0\u4EE3\u7406\u6570\u636E\uFF0C\u65F6\u95F4: " + (/* @__PURE__ */ new Date()).toISOString());
    let existingProxies = [];
    let existingData;
    try {
      existingData = await env.proxyworker.get("list");
      if (existingData) {
        existingProxies = JSON.parse(existingData);
        console.log("\u6210\u529F\u83B7\u53D6\u73B0\u6709\u4EE3\u7406\u5217\u8868\u4F5C\u4E3A\u5907\u4EFD\uFF0C\u5171 " + existingProxies.length + " \u4E2A");
      }
    } catch (e) {
      console.error("\u8BFB\u53D6\u73B0\u6709\u4EE3\u7406\u5217\u8868\u5931\u8D25:", e);
    }
    const requestUrl = new URL(env.__STATIC_CONTENT_MANIFEST || "");
    let baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    if (!baseUrl || baseUrl === "//") {
      try {
        const cfEnv = env.CF_PAGES_URL || env.CF_WORKER_DOMAIN || "https://proxy-worker.your-domain.workers.dev";
        baseUrl = new URL(cfEnv).origin;
      } catch (e) {
        baseUrl = "https://proxy-worker.your-domain.workers.dev";
      }
    }
    console.log("\u5C1D\u8BD5\u4ECE " + baseUrl + "/proxies.json \u83B7\u53D6\u6700\u65B0\u4EE3\u7406\u6570\u636E...");
    try {
      const cacheBuster = "?t=" + Date.now() + "&r=" + Math.random();
      const proxyDataResp = await fetch(baseUrl + "/proxies.json" + cacheBuster, {
        cf: { cacheTtl: 0 },
        // 禁用CF缓存
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
      if (proxyDataResp.ok) {
        console.log("\u6210\u529F\u83B7\u53D6\u4EE3\u7406\u6570\u636E\u6587\u4EF6");
        const proxyData = await proxyDataResp.text();
        try {
          const proxies = JSON.parse(proxyData);
          if (Array.isArray(proxies) && proxies.length > 0) {
            const validProxies = proxies.filter(
              (p) => p && p.ip && p.port && p.type && p.https
            );
            if (existingProxies.length > 0) {
              const existingMap = {};
              existingProxies.forEach((p) => {
                if (p && p.ip && p.port) {
                  const key = p.ip + ":" + p.port;
                  existingMap[key] = p;
                }
              });
              let regionUpdatedCount = 0;
              validProxies.forEach((p) => {
                const key = p.ip + ":" + p.port;
                const existingProxy = existingMap[key];
                if (existingProxy && existingProxy.region && existingProxy.region !== "\u672A\u77E5" && existingProxy.region !== "\u672A\u68C0\u6D4B" && existingProxy.region !== "" && (!p.region || p.region === "\u672A\u77E5" || p.region === "\u672A\u68C0\u6D4B" || p.region === "")) {
                  console.log("\u4FDD\u7559\u73B0\u6709\u5730\u533A\u4FE1\u606F: " + key + " => " + existingProxy.region);
                  p.region = existingProxy.region;
                  regionUpdatedCount++;
                }
              });
              console.log("\u5B8C\u6210\u5730\u533A\u4FE1\u606F\u5408\u5E76\uFF0C\u5171\u66F4\u65B0 " + regionUpdatedCount + " \u4E2A\u4EE3\u7406\u7684\u5730\u533A\u4FE1\u606F");
            }
            const currentTime = /* @__PURE__ */ new Date();
            const isoTime = currentTime.toISOString();
            console.log("\u66F4\u65B0\u4EE3\u7406\u65F6\u95F4\u6233\u4E3A: " + isoTime);
            validProxies.forEach((p) => {
              p.last_check = isoTime;
              if (!p.region || p.region.trim() === "") {
                p.region = "\u672A\u68C0\u6D4B";
              }
            });
            await env.proxyworker.put("list", JSON.stringify(validProxies));
            try {
              const cfUrl = new URL(env.CF_PAGES_URL || env.CF_WORKER_DOMAIN || request.url);
              const assetUpdateUrl = `${cfUrl.protocol}//${cfUrl.host}/update-proxies`;
              const updateResponse = await fetch(assetUpdateUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Update-Secret": env.UPDATE_SECRET || "default-secret"
                },
                body: JSON.stringify(validProxies)
              });
              if (updateResponse.ok) {
                console.log("\u6210\u529F\u66F4\u65B0\u9759\u6001\u4EE3\u7406\u6587\u4EF6");
              } else {
                console.error("\u66F4\u65B0\u9759\u6001\u4EE3\u7406\u6587\u4EF6\u5931\u8D25:", await updateResponse.text());
              }
            } catch (writeErr) {
              console.error("\u5199\u5165\u9759\u6001\u4EE3\u7406\u6587\u4EF6\u65F6\u51FA\u9519:", writeErr);
            }
            console.log("\u6210\u529F\u66F4\u65B0\u4EE3\u7406\u5217\u8868\u5230 KV\uFF0C\u5171 " + validProxies.length + " \u4E2A\u6709\u6548\u4EE3\u7406\uFF0C\u66F4\u65B0\u65F6\u95F4: " + currentTime.toLocaleString());
            return;
          } else {
            console.log("\u6587\u4EF6\u4E2D\u7684\u4EE3\u7406\u6570\u636E\u4E3A\u7A7A\u6216\u683C\u5F0F\u65E0\u6548");
          }
        } catch (parseErr) {
          console.error("\u89E3\u6790\u4EE3\u7406\u6570\u636E\u5931\u8D25:", parseErr);
        }
      } else {
        console.log("\u65E0\u6CD5\u83B7\u53D6\u4EE3\u7406\u6570\u636E\u6587\u4EF6: " + proxyDataResp.status + " " + proxyDataResp.statusText);
      }
    } catch (fetchErr) {
      console.error("\u83B7\u53D6\u4EE3\u7406\u6570\u636E\u6587\u4EF6\u5931\u8D25:", fetchErr);
    }
    if (existingProxies.length > 0) {
      console.log("\u65E0\u6CD5\u83B7\u53D6\u6700\u65B0\u4EE3\u7406\u6570\u636E\uFF0C\u4FDD\u7559\u73B0\u6709\u6570\u636E\uFF08" + existingProxies.length + "\u4E2A\u4EE3\u7406\uFF09");
      return;
    }
    console.log("\u5C1D\u8BD5\u4ECE\u591A\u4E2A\u4EE3\u7406API\u76F4\u63A5\u83B7\u53D6\u4EE3\u7406...");
    const protocols = [
      { protocol: "http", type: "HTTP" },
      { protocol: "socks4", type: "SOCKS4" },
      { protocol: "socks5", type: "SOCKS5" }
    ];
    let list = [];
    for (const p of protocols) {
      try {
        const apiSources = [
          "https://api.proxyscrape.com/v2/?request=getproxies&protocol=" + p.protocol + "&timeout=10000&country=all&ssl=all&anonymity=all",
          "https://www.proxy-list.download/api/v1/get?type=" + p.protocol.toUpperCase(),
          "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/" + p.protocol + ".txt",
          "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/" + p.protocol + ".txt",
          "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/" + p.protocol + ".txt",
          "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt"
        ];
        for (const apiUrl of apiSources) {
          try {
            console.log("\u5C1D\u8BD5\u4ECE " + apiUrl + " \u83B7\u53D6" + p.type + "\u4EE3\u7406...");
            const res = await fetch(apiUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            if (!res.ok) {
              console.error("\u4ECE " + apiUrl + " \u83B7\u53D6" + p.type + "\u4EE3\u7406\u5931\u8D25: " + res.status);
              continue;
            }
            const text = await res.text();
            if (!text || !text.includes(":")) {
              console.error("\u4ECE " + apiUrl + " \u83B7\u53D6\u7684\u5185\u5BB9\u65E0\u6548\uFF0C\u4E0D\u5305\u542B\u4EE3\u7406\u6570\u636E");
              continue;
            }
            const arr = text.split("\n").filter((line) => line.includes(":")).map((line) => {
              const [ip, port] = line.trim().split(":");
              return {
                ip,
                port,
                type: p.type,
                https: "\u5F85\u68C0\u6D4B",
                region: "\u672A\u68C0\u6D4B",
                last_check: (/* @__PURE__ */ new Date()).toISOString(),
                validated: true
              };
            });
            if (arr.length > 0) {
              console.log("\u6210\u529F\u4ECE " + apiUrl + " \u83B7\u53D6" + p.type + "\u4EE3\u7406\uFF0C\u5171" + arr.length + "\u4E2A");
              list = list.concat(arr);
              break;
            }
          } catch (e) {
            console.error("\u4ECE " + apiUrl + " \u83B7\u53D6" + p.type + "\u4EE3\u7406\u65F6\u51FA\u9519:", e);
          }
        }
      } catch (e) {
        console.error("\u83B7\u53D6" + p.type + "\u4EE3\u7406\u65F6\u51FA\u9519:", e);
      }
    }
    if (list.length > 0) {
      if (existingProxies.length > 0) {
        const existingMap = {};
        existingProxies.forEach((p) => {
          if (p && p.ip && p.port) {
            const key = p.ip + ":" + p.port;
            existingMap[key] = p;
          }
        });
        list.forEach((p) => {
          const key = p.ip + ":" + p.port;
          const existingProxy = existingMap[key];
          if (existingProxy && existingProxy.region && existingProxy.region !== "\u672A\u77E5" && existingProxy.region !== "\u672A\u68C0\u6D4B" && existingProxy.region !== "") {
            console.log("\u4FDD\u7559API\u4EE3\u7406\u5730\u533A\u4FE1\u606F: " + key + " => " + existingProxy.region);
            p.region = existingProxy.region;
          }
        });
      }
      console.log("\u5171\u83B7\u53D6\u5230 " + list.length + " \u4E2A\u4EE3\u7406\uFF0C\u51C6\u5907\u66F4\u65B0\u5230KV...");
      try {
        await env.proxyworker.put("list", JSON.stringify(list));
        console.log("\u6210\u529F\u4ECEAPI\u66F4\u65B0\u4EE3\u7406\u5217\u8868\uFF0C\u5171" + list.length + "\u4E2A\u4EE3\u7406");
      } catch (kvError) {
        console.error("\u5B58\u50A8\u4EE3\u7406\u5217\u8868\u5230KV\u65F6\u51FA\u9519:", kvError);
      }
    } else {
      console.error("\u65E0\u6CD5\u83B7\u53D6\u4EFB\u4F55\u4EE3\u7406\u6570\u636E\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216API\u53EF\u7528\u6027");
    }
  } catch (err) {
    console.error("\u83B7\u53D6\u4EE3\u7406\u5217\u8868\u5931\u8D25:", err);
  }
}
__name(fetchAndStore, "fetchAndStore");

// ../../../usr/local/share/nvm/versions/node/v20.19.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request2, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request2, env);
  } finally {
    try {
      if (request2.body !== null && !request2.bodyUsed) {
        const reader = request2.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../usr/local/share/nvm/versions/node/v20.19.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request2, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request2, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0o26pU/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../usr/local/share/nvm/versions/node/v20.19.0/lib/node_modules/wrangler/templates/middleware/common.ts
init_strip_cf_connecting_ip_header();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request2, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request2, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request2, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request2, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0o26pU/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request2, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request2, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request2, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request2, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request2, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request2);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request2) {
      return __facade_invoke__(
        request2,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
