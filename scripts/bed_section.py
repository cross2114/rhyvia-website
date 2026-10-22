"""Bilingual rhythm-bed editorial section, replacing the chair comparison table."""

def build_bed_section(bi, img, button, label, title):
    inquiry = '/experience/?chair=BED#request'
    icons = {
        'size': '<path d="M7 21v-9h26v9M5 21h30v10H5zM8 31v4m24-4v4M11 16h7v5m4-5h7v5"/>',
        'fabric': '<path d="m20 4 16 16-16 16L4 20Z M12 12l16 16M8 16l16 16M16 8l16 16M28 12 12 28M24 8 8 24M32 16 16 32"/>',
        'delivery': '<path d="M4 10h20v20H4zM24 17h7l5 7v6h-4m-8 0h2M28 18v7h8"/><circle cx="11" cy="30" r="4"/><circle cx="29" cy="30" r="4"/>',
    }
    features = [
        ('size', '定制尺寸', 'Sized for your space', '多种尺寸与组合可选。', 'A choice of sizes and configurations.'),
        ('fabric', '高级面料', 'Considered materials', '多种面料与饰面，适配您的空间。', 'A selection of fabrics and finishes to complement your space.'),
        ('delivery', '配送规划', 'Delivery, considered', '提供咨询、配送及安装支持。', 'Support with consultation, delivery and installation.'),
    ]
    content = '<section class="rhythm-bed section-pad" id="rhythm-bed" aria-labelledby="bed-title">'
    content += '<span id="compare" aria-hidden="true"></span><header class="bed-heading reveal">'
    content += label('不止于椅', 'BEYOND THE CHAIR')
    content += bi('h2', '律动健康科技，<br>为深度休息而生。', 'Rhythm technology.<br>Made for deeper rest.', 'id="bed-title"')
    content += bi('p', 'RHYVIA 律动床将温和的水平律动延伸至全尺寸床体，<br>为休息与放松带来更完整的体验。接受特别订购。', 'The RHYVIA rhythm bed brings gentle horizontal motion to a full-size bed.<br>A more complete experience of rest and relaxation, available by special order.', 'class="section-lead"')
    content += '</header><figure class="bed-scene reveal">'
    content += img('rhythm-bed-20261022.jpg', '暖色卧室中的 RHYVIA 双床组合律动床', 'The RHYVIA rhythm bed in a warm, sunlit bedroom', 'bed-photo')
    content += '<a class="bed-order-tag" href="#bed-inquiry">'+bi('span', '特别订购', 'SPECIAL ORDER')+'<span aria-hidden="true">↗</span></a>'
    content += '<figcaption class="bed-scene-caption">RHYVIA · '+bi('span', '律动床', 'RHYTHM BED')+'</figcaption>'
    content += '<button type="button" class="bed-view" data-bed-open aria-haspopup="dialog" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/></svg>'+bi('span', '查看大图', 'View the setting')+'</button></figure>'
    content += '<div class="bed-experience reveal"><div>'+label('全身沉浸式体验', 'A FULL-BODY EXPERIENCE')+title('全身沉浸式<br>RHYVIA 体验', 'Room to rest.<br>Rhythm to unwind.')+'</div>'
    content += bi('p', '专为更长时间、更从容的体验而设计，律动床让全身在休息中感受 RHYVIA 水平律动。', 'Designed for longer, more unhurried moments, the rhythm bed lets your whole body experience RHYVIA horizontal motion as you rest.', 'class="section-lead"')+'</div>'
    content += '<div class="bed-features">'
    for i, (key, zh, en, body_zh, body_en) in enumerate(features):
        content += f'<article class="bed-feature reveal" style="--reveal-delay:{i * 80}ms"><span class="bed-feature-number" aria-hidden="true">0{i+1}</span><span class="bed-feature-icon"><svg viewBox="0 0 40 40" aria-hidden="true">{icons[key]}</svg></span>'+bi('h3', zh, en)+bi('p', body_zh, body_en)+'</article>'
    content += '</div><div class="bed-inquiry reveal" id="bed-inquiry"><div>'+label('特别订购服务', 'SPECIAL ORDER SERVICE')+title('为您的空间<br>量身打造。', 'Made to belong<br>in your space.')+bi('p', '欢迎联系我们，了解您所在地区的尺寸、饰面及供应信息。', 'Contact us to explore sizes, finishes and availability in your region.', 'class="section-lead"')+'</div>'
    content += button('咨询律动床', 'Enquire about the rhythm bed', inquiry)+'</div></section>'
    content += '<dialog class="bed-dialog" id="bed-dialog" aria-labelledby="bed-dialog-title"><div class="bed-dialog-bar">'+bi('p', 'RHYVIA 律动床', 'RHYVIA rhythm bed', 'id="bed-dialog-title"')+'<button type="button" data-bed-close>'+bi('span', '关闭', 'Close')+'<span aria-hidden="true">×</span></button></div>'+img('rhythm-bed-20261022.jpg', 'RHYVIA 律动床完整场景', 'Full view of the RHYVIA rhythm bed setting')+'</dialog>'
    return content
